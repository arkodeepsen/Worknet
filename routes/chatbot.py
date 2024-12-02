# -*- coding: utf-8 -*-
from flask import jsonify, request
import google.generativeai as genai
import os
import sqlite3
from datetime import datetime
import logging
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Get the API key from environment variables
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Configure the Google Generative AI SDK
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize model with safety settings
generation_config = {
    'temperature': 0.7,  # More creative but still focused
    'top_p': 0.9,       # Better response diversity
    'top_k': 40,        # Better vocabulary selection
    'max_output_tokens': 2048,  # Longer responses when needed
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_DANGEROUS",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
]

model = genai.GenerativeModel(
    model_name='gemini-pro',
    generation_config=generation_config,
    safety_settings=safety_settings
)

# Cache for summarization to reduce API calls
@lru_cache(maxsize=100)
def summarize_text(text):
    try:
        response = model.generate_content(f"Summarize this in no more than 2 sentences: {text}")
        return response.text
    except Exception as e:
        logging.error(f"Summarization error: {str(e)}")
        return ""

def create_career_counsellor_prompt(user_details):
    """Create a detailed system prompt for better responses"""
    return f"""You are WorkNet Career Counsellor, an expert career guidance professional. Your role is to provide personalized advice to users seeking career guidance. You can and will only answer queries related to jobs, internships, companies, education, career guidance and related subject matter. You are multi-lingual and can answer in any language according to user's preference, english being the default. You are empathetic, professional, and knowledgeable in your field.

Keep in mind these user details while providing advice:
{user_details}

Focus on practical, actionable advice that aligns with the user's skills, education, and career goals.
"""

def handle_query(query, context, user_details, contact_details, toolspage):
    try:
        # Get summary of previous context if it exists
        summary = ""
        if context and context[-1]:
            summary = summarize_text(context[-1])
        if toolspage:
            query += "\nRespond with a small summary under 5 sentences for this query."
            logging.info(f"Toolspage: {toolspage}")
        else:
            logging.info(f"Toolspage: {toolspage}")
        logging.debug(f"Query: {query}")
        logging.debug(f"Summary: {summary}")

        # Construct full context with better formatting
        full_context = (
            f"{create_career_counsellor_prompt(user_details)}\n\n"
            f"Previous conversation summary: {summary}\n\n"
            f"Current query: {query}\n\n"
            f"Contact information: {contact_details}"
        ) if context else (
            f"{create_career_counsellor_prompt(user_details)}\n\n"
            f"Query: {query}\n\n"
            f"Contact information: {contact_details}"
        )

        logging.debug(f"Full context for query: {full_context}")
        
        # Generate response with error handling and retries
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = model.generate_content(full_context)
                response_text = response.text
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    logging.error(f"Final attempt failed: {str(e)}")
                    return context
                logging.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                continue
        
        # Update context
        context = context or []
        context.append(response_text)
        logging.debug(f"Response: {response_text}")
        return context

    except Exception as e:
        logging.error(f"Error in handle_query: {str(e)}")
        return context

def get_db_connection():
    """Create a database connection with timeout and error handling"""
    try:
        conn = sqlite3.connect('chatbot.db', timeout=30)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logging.error(f"Database connection error: {str(e)}")
        raise

def save_message(user_id, message, sender):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        timestamp = datetime.now().isoformat()
        cursor.execute('''
            INSERT INTO chat_history (user_id, message, sender, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (user_id, message, sender, timestamp))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        logging.error(f"Error saving message: {str(e)}")
        raise

def get_chat_history(user_id, limit=50):
    """Get chat history with pagination"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT message, sender 
            FROM chat_history
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        return [{'message': row[0], 'sender': row[1]} for row in rows][::-1]  # Reverse to get chronological order
    except sqlite3.Error as e:
        logging.error(f"Error retrieving chat history: {str(e)}")
        return []

def chat():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Extract user details with default values
        user_details = {
            'firstname': data.get('firstname', ''),
            'lastname': data.get('lastname', ''),
            'city': data.get('city', ''),
            'gender': data.get('gender', ''),
            'languages': data.get('languages', ''),
            'type': data.get('type', ''),
            'courses': data.get('courses', ''),
            'college': data.get('college', ''),
            'stream': data.get('stream', ''),
            'startYear': str(data.get('startYear', '')),
            'endYear': str(data.get('endYear', '')),
            'skills': data.get('skills', '')
        }
        
        toolspage = data.get('tools', '')

        # Format user details string
        user_details_str = "\nAbout User:" + "".join(
            f"\n{key.title()}: {value}" for key, value in user_details.items()
        )

        contact_details = (
            f"\nEmail: {data.get('email', '')}"
            f"\nContact: {data.get('contact', '')}"
        )

        user_message = data.get('message', '').strip()
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        logging.debug(f"Processing request for User ID: {user_id}")
        
        context = [msg['message'] for msg in get_chat_history(user_id) if msg['sender'] == 'bot']
        context = handle_query(user_message, context, user_details_str, contact_details, toolspage)
        
        save_message(user_id, user_message, 'user')
        if context:
            save_message(user_id, context[-1], 'bot')
        
        return jsonify({
            'response': context[-1] if context else "I apologize, but I'm unable to process your request at the moment. Please try again.",
            'context': context
        })

    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

# Rest of your code (greeting, get_chat_history_endpoint, clear_chat_history) remains the same

def greeting():
    default_greeting = "Hello! I am the WorkNet career counsellor bot. I can assist you with job search, career guidance, internships, resumes, and interview tips. How may I help you today?"
    return jsonify(response=default_greeting)

def get_chat_history_endpoint(user_id):
    try:
        history = get_chat_history(user_id)
        return jsonify({'history': history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def clear_chat_history(user_id):
    try:
        conn = sqlite3.connect('chatbot.db')
        cursor = conn.cursor()

        # Fetch chat history to back it up
        cursor.execute('SELECT * FROM chat_history WHERE user_id = ?', (user_id,))
        chat_history = cursor.fetchall()

        # Insert chat history into backup table with deletion timestamp
        deletion_timestamp = datetime.now().isoformat()
        for record in chat_history:
            cursor.execute('INSERT INTO chat_history_backup (user_id, sender, message, timestamp, deletion_timestamp) VALUES (?, ?, ?, ?, ?)', 
                           (record[1], record[2], record[3], record[4], deletion_timestamp))

        # Delete chat history from the original table
        cursor.execute('DELETE FROM chat_history WHERE user_id = ?', (user_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Chat history cleared and backed up'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500