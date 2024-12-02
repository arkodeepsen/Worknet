import os
import google.generativeai as genai
from flask import request, jsonify
import logging

logging.basicConfig(level=logging.DEBUG)

# Get the API key from environment variables
GOOGLE_API_KEY = os.getenv('GEMINI_PRO_API_KEY')

if not GOOGLE_API_KEY:
    raise ValueError("No API key found. Please set the GEMINI_PRO_API_KEY environment variable.")

# Configure the Google Generative AI SDK with your API key
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the generative model
try:
    model = genai.GenerativeModel('gemini-1.5-flash')  # Replace 'gemini-pro' with the model you want to use
except Exception as e:
    print(f"Error initializing generative model: {e}")
    raise

def generate_job_description():
    job_title = request.args.get('jobTitle')
    if not job_title:
        return jsonify({'success': False, 'message': 'Job title is required'}), 400
    
    try:
        prompt = (
        f"You are a job description generator specialized in creating concise and relevant job descriptions. "
        f"Generate a professional job description in 20 bullet points for the job title: {job_title}. "
        f"Ensure each bullet point clearly describes a key responsibility or requirement. "
        f"Use the following format:\n\n"
        f"- Task or responsibility #1\n"
        f"- Task or responsibility #2\n"
        f"- Task or responsibility #3\n"
        f"- Task or responsibility #4\n"
        f"- Task or responsibility #5\n"
        f"- Task or responsibility #6\n"
        f"- Task or responsibility #7\n"
        f"- Task or responsibility #8\n"
        f"- Task or responsibility #9\n"
        f"- Task or responsibility #10\n\n"
        f"Only generate the list without asking for more information or providing additional context."
        )
        response = model.generate_content(prompt)
        logging.info(f"Generated job description: {response.text}")
        return jsonify({'success': True, 'description': response.text})
    except Exception as e:
        print(f"Error generating job description: {e}")
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500
    
def generate_summary():
    try:
        job_title = request.args.get('jobTitle', 'professional')  # Optional, default to 'professional'
        skills = request.args.get('skills', 'team player, problem solver')  # Optional, default to 'team player, problem solver'
        experience = request.args.get('experience', '5 years')  # Optional, default to '5 years'
        # Prompt to generate a summary paragraph
        prompt = (
            f"You are an expert in crafting professional summaries for resumes. "
            f"Generate a concise and impactful summary paragraph for a {job_title} with {experience} experience who specializes in {skills}. "
            f"Include key skills, experience, and qualities that make the individual stand out. "
            f"Ensure the summary is engaging and fits within 2-3 sentences without bullet points. "
            f"Use a professional tone similar to the examples found on job platforms like jobhero.com. "
            f"Here’s an example format:\n\n"
            f"Resourceful team player with experience in [area of expertise]. Skilled at [key skills]. "
            f"Well-versed in [relevant industry or tools] with a history of [notable accomplishments]."
        )

        # Generate summary using the AI model
        response = model.generate_content(prompt)
        logging.info(f"Generated user summary: {response.text}")
        return jsonify({'success': True, 'summary': response.text})
    
    except Exception as e:
        print(f"Error generating summary: {e}")
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500
