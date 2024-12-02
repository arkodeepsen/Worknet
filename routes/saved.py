from flask import Flask, jsonify, request
import sqlite3
import pandas as pd

app = Flask(__name__)

# Load job data from CSV
df_jobs = pd.read_csv('data/jobs.csv')

# Function to get database connection
def get_db_connection():
    conn = sqlite3.connect('database.sqlite')
    conn.row_factory = sqlite3.Row
    return conn

def get_saved_jobs(user_id):
    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query to get job IDs for the given user ID
    cursor.execute('SELECT job_id FROM saved_jobs WHERE user_id = ?', (user_id,))
    job_ids = cursor.fetchall()

    # Close the database connection
    conn.close()

    # If no job IDs found, return an empty list
    if not job_ids:
        return jsonify({"success": True, "jobs": []})

    # Extract job IDs from the query result
    job_ids = [row['job_id'] for row in job_ids]

    # Filter job details from the DataFrame based on job IDs
    saved_jobs = df_jobs[df_jobs['key_id'].isin(job_ids)].to_dict(orient='records')

    return jsonify({"success": True, "jobs": saved_jobs})
