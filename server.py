from flask import Flask, request, json
from routes.skill import suggest_skill 
from routes.saved import get_saved_jobs 
from routes.knn import get_similar_jobs
from routes.job import get_filtered_jobs, get_job_details, search
from routes.recommend_knn import recommend_jobs
from routes.chatbot import greeting, chat, get_chat_history_endpoint, clear_chat_history
from routes.resume_ai import generate_job_description, generate_summary
from routes.init_db import init_db
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

init_db()

@app.route('/')
def index():
    return '''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Flask Backend</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin-top: 50px;
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #666;
                }
                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #007BFF;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
                a:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to the Flask Backend</h1>
            <p>This is the backend server for our application. You should probably use the main website for a better experience.</p>
            <a href="http://localhost:3000">Return to Homepage</a>
        <div>
            <a href="/">Home</a>
            <a href="/status">Status Page</a>
            <a href="/filtered-jobs">Filtered Jobs</a>
            <a href="/search-jobs">Search Jobs</a>
            <a href="/job-details/1">Job Details</a>
            <a href="/suggest-skill">Suggest Skill</a>
            <a href="/saved-jobs/1">Saved Jobs</a>
            <a href="/similar-jobs/1">Similar Jobs</a>
            <a href="/recommend-jobs">Recommend Jobs</a>
            <a href="/greeting">Greeting</a>
            <a href="/chat">Chat</a>
            <a href="/get-chat-history/1">Get Chat History</a>
            <a href="/clear-chat-history/1">Clear Chat History</a>
            <a href="/generate-job-description">Generate Job Description</a>
            <a href="/generate-summary">Generate Summary</a>
        </div>
        </body>
        </html>
    '''

@app.route('/status')
def status():
    return '''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Status Page</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin-top: 50px;
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #666;
                }
                .status {
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #28a745;
                    color: white;
                    border-radius: 5px;
                    display: inline-block;
                }
                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #007BFF;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
                a:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <h1>Server Status</h1>
            <p class="status">Status: OK</p>
            <p>All systems are operational.</p>
            <div>
            <a href="/">Home</a>
            </div>
        </body>
        </html>
    '''
    
# Add this route to handle default greeting
@app.route('/greeting', methods=['GET'])
def greet():
    return greeting()

@app.route('/chat', methods=['POST'])
def chatbot():
    return chat()

@app.route('/get-chat-history/<user_id>', methods=['GET'])
def get_chat_history_route(user_id):
    return get_chat_history_endpoint(user_id)

@app.route('/clear-chat-history/<user_id>', methods=['DELETE'])
def clear_chat_history_route(user_id):
    return clear_chat_history(user_id)

@app.route('/generate-job-description', methods=['GET'])
def generate_job_description_route():
    return generate_job_description()

@app.route('/generate-summary', methods=['GET'])
def generate_summary_route():
    return generate_summary()

@app.route('/filtered-jobs', methods=['GET'])
def filtered_jobs():
    return get_filtered_jobs()
    
# Route to search jobs (returns job IDs)
@app.route('/search-jobs', methods=['POST'])
def search_jobs():
    return search()

# Route to fetch full job details by job_id
@app.route('/job-details/<int:job_id>', methods=['GET'])
def job_details(job_id):
    return get_job_details(job_id)

@app.route('/suggest-skill', methods=['POST'])
def suggest_skill_route():
    return suggest_skill()

@app.route('/saved-jobs/<int:user_id>', methods=['GET'])
def saved_jobs(user_id):
    return get_saved_jobs(user_id)

@app.route('/similar-jobs/<int:job_id>', methods=['GET'])
def similar_jobs(job_id):
    return get_similar_jobs(job_id)
    
@app.route('/recommend-jobs', methods=['POST'])
def recommend_jobs_route():
    return recommend_jobs()

if __name__ == '__main__':
    app.run(port=5000, debug=True)