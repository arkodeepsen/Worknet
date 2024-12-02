import pandas as pd
import ast
import logging
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load environment variables from .env file
load_dotenv()
logging.basicConfig(level=logging.DEBUG)
# Get the API key from environment variables
GOOGLE_API_KEY = os.getenv('GEMINI_PRO_API_KEY')

# Configure the Google Generative AI SDK with your API key
genai.configure(api_key=GOOGLE_API_KEY)

def generate_smart_query(user_input):
    if not user_input.strip():
        return ""
    
    # Detailed instructions for the AI system
    prompt = f"""
    Generate a smart query for the following user input: "{user_input}"
    
    Instructions:
    1. Identify relevant keywords such as job titles, locations, companies, skills, and job types.
    2. Normalize the terms by converting them to lowercase and removing unnecessary spaces or punctuation.
    3. Combine the identified keywords into a comma-separated query string.
    
    Examples:
    - Input: "datascience jobs in hyderabad"
      Output: "datascientist,hyderabad"
    - Input: "I'm looking for an internship at Google near Bengaluru and I'm skilled in Java and Python"
      Output: "internship,google,bengaluru,bangalore,java,python"
    """
    
    # Initialize the AI model
    model = genai.GenerativeModel('gemini-1.5-flash-8b')
    
    # Generate the query using the AI model
    response = model.generate_content(prompt)
    smart_query = response.text.strip()
    
    logging.info(f"User input: {user_input}")
    logging.info(f"Prompt: {prompt}")
    logging.debug(f"Generated smart query: {smart_query}")
    return smart_query

# Function to extract values from 'job_type_skills'
def extract_values(x):
    try:
        # Use ast.literal_eval for safer evaluation
        list_of_lists = list(ast.literal_eval(x).values())
        # Flatten the list of lists
        return [item for sublist in list_of_lists for item in sublist]
    except (ValueError, SyntaxError):
        return []  # Return an empty list if evaluation fails

# Load the original dataset
df_original = pd.read_csv("data/jobs.csv")  # Original CSV used for detailed job information

# Load and preprocess dataset for searching
jobs = df_original.copy()
jobs = jobs.rename(columns={'key_id': 'job_id'})
jobs = jobs[['job_id', 'job_title_short', 'job_title', 'job_location', 'job_schedule_type', 'company_name', 'job_type_skills']]
jobs.dropna(inplace=True)

# Apply the 'extract_values' function to the 'job_type_skills' column
jobs['job_type_skills'] = jobs['job_type_skills'].apply(extract_values)

# Continue with the rest of your processing...
jobs['job_title_short'] = jobs['job_title_short'].str.replace(" ", "")
jobs['job_title'] = jobs['job_title'].str.replace(" ", "")
jobs['job_title'] = jobs['job_title_short'].astype(str) + " " + jobs['job_title'].astype(str)
jobs['job_title'] = jobs['job_title'].apply(lambda x: x.split(" "))
jobs = jobs.drop('job_title_short', axis=1)
jobs['job_location'] = jobs['job_location'].apply(lambda x: x.split(","))
jobs['company_name'] = jobs['company_name'].str.replace(" ", "")
jobs['job_schedule_type'] = jobs['job_schedule_type'].apply(lambda x: [i.replace('-', '').lower() for i in x.split()])
jobs['company_name'] = jobs['company_name'].apply(lambda x: [x])

# Replace applymap with apply (to avoid the deprecation warning)
for col in ['job_title', 'company_name', 'job_location', 'job_schedule_type']:
    jobs[col] = jobs[col].apply(lambda x: [i.lower() for i in x])

#copydf = jobs.copy()

# Advanced search function
def advanced_search_jobs(user_input, copydf):
    # Generate smart query using AI
    search_string = generate_smart_query(user_input)
    
    query_list = search_string.split(",")
    query_list = [term.replace(" ", "").strip().lower() for term in query_list]
    
    company_name, job_location, job_schedule_type, job_title, job_type_skills = [], [], [], [], []
    
    for term in query_list:
        term = term.strip().lower()
        for index, row in copydf.iterrows():
            if term in row['job_type_skills']:
                job_type_skills.append(row['job_id'])
                continue
            if term in row['company_name']:
                company_name.append(row['job_id'])
                continue
            if term in row['job_location']:
                job_location.append(row['job_id'])
                continue
            if term in row['job_schedule_type']:
                job_schedule_type.append(row['job_id'])
                continue
            if term in row['job_title']:
                job_title.append(row['job_id'])
                continue

    non_empty_lists = [lst for lst in [company_name, job_location, job_schedule_type, job_title, job_type_skills] if lst]
    if non_empty_lists:
        matching_ids = set(non_empty_lists[0])
        for lst in non_empty_lists[1:]:
            matching_ids.intersection_update(lst)
        matching_ids = list(matching_ids)
    else:
        matching_ids = []

    return matching_ids

# Load jobs data
#jobs_df = pd.read_csv('data/jobs.csv')

# Filter out rows with missing skills or type skills
def filter_jobs_with_skills(df):
    return df.dropna(subset=['job_skills', 'job_type_skills'], how='all')  # Keep rows with any non-NaN in these columns

jobs_df_filtered = filter_jobs_with_skills(df_original)

def get_filtered_jobs():
    try:
        params = request.args
        page = int(params.get('page', 1))
        page_size = int(params.get('page_size', 50))
        
        # Get random jobs with skills or type skills
        total_jobs = jobs_df_filtered.shape[0]
        start = (page - 1) * page_size
        end = start + page_size
        jobs_with_skills = jobs_df_filtered.sample(n=total_jobs).iloc[start:end].to_dict(orient='records')
        
        # Ensure job_id is included in the response
        for job in jobs_with_skills:
            job['job_id'] = job['key_id']  # Assuming 'key_id' is the unique identifier
        
        return jsonify({
            "results": jobs_with_skills,
            "total_results": total_jobs,
            "page": page,
            "page_size": page_size
        })
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        return jsonify({'error': 'Failed to fetch jobs'}), 500

def search():
    params = request.json
    user_input = params.get('skills', '')
    page = int(params.get('page', 1))
    page_size = int(params.get('page_size', 50))
    
    # Generate smart query using AI
    search_string = generate_smart_query(user_input)
    
    matching_ids = advanced_search_jobs(search_string, jobs)
    
    # Paginate the results
    start = (page - 1) * page_size
    end = start + page_size
    paginated_ids = matching_ids[start:end]
    
    # Just return the job IDs for the search results
    results = [{"job_id": job_id} for job_id in paginated_ids]
    return jsonify({
        "results": results,
        "total_results": len(matching_ids),
        "page": page,
        "page_size": page_size
    })

def get_job_details(job_id):
    job = df_original[df_original['key_id'] == job_id]  # Fetch from the original CSV
    
    if job.empty:
        return jsonify({"error": "Job not found"}), 404
    
    job_details = job.to_dict('records')[0]
    return jsonify(job_details)
