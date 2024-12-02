import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
logging.basicConfig(level=logging.DEBUG)

# Load the skill map from the file and parse it correctly
skill_map = {}
try:
    with open('data/skill_map.txt', 'r') as file:
        for line in file:
            # Split line into skill and its related skills
            skill, related_skills = line.strip().split(':')
            skill = skill.strip()

            # Process each related skill to remove unwanted characters
            related_skills = [
                s.strip("[] ").replace('"', '')  # Remove brackets and quotes
                for s in related_skills.split(',')
            ]

            # Only add to skill_map if related_skills is a clean list
            if related_skills:
                skill_map[skill] = related_skills

    logging.debug(f"Loaded skill map: {skill_map}")
except Exception as e:
    logging.error(f"Error loading skill map: {str(e)}")

# Flatten the skill map into a list of skills
technical_skills = list(skill_map.keys())

# Dictionary to store suggested skills for each user temporarily
user_suggested_skills = {}

# API endpoint to suggest a skill based on user input
def suggest_skill():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        # Convert user skills to lowercase for consistent comparison
        user_skills = {skill.lower() for skill in data.get('skills', [])}

        # Log the user data to check if it is correctly received
        logging.debug(f"Raw request body: {request.data.decode('utf-8')}")
        logging.debug(f"Received JSON: {request.json}")
        logging.debug(f"Parsed User ID: {user_id}")
        logging.debug(f"Parsed User Skills: {user_skills}")

        # Initialize the user's suggested skills list if not present
        if user_id not in user_suggested_skills:
            user_suggested_skills[user_id] = set()

        # Already suggested skills for this user
        already_suggested = user_suggested_skills[user_id]
        suggested_skill = None

        if user_skills:
            # Suggest a similar skill based on the user's existing skills
            for skill in user_skills:
                if skill in skill_map:
                    related_skills = skill_map[skill]
                    # Ensure related skills are not already suggested or in user skills
                    remaining_skills = [
                        s for s in related_skills
                        if s.lower() not in already_suggested and s.lower() not in user_skills
                    ]
                    if remaining_skills:
                        suggested_skill = random.choice(remaining_skills)
                        break

        if not suggested_skill:
            # Suggest a random technical skill that hasn't been suggested or used
            remaining_skills = [
                skill for skill in technical_skills
                if skill.lower() not in already_suggested and skill.lower() not in user_skills
            ]
            if remaining_skills:
                suggested_skill = random.choice(remaining_skills)
            else:
                return jsonify({"error": "No more new skills to suggest!"}), 400

        # Log the final suggested skill before returning it
        logging.info(f"Final Suggested Skill: {suggested_skill}")

        # Add the suggested skill to the user's suggested skills list
        user_suggested_skills[user_id].add(suggested_skill.lower())  # Store as lowercase for consistency

        # Return the suggested skill with the first letter capitalized
        return jsonify({"suggestedSkill": suggested_skill.capitalize()})

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
