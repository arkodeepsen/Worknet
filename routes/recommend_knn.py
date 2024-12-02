from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.neighbors import NearestNeighbors
import ast
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the jobs data and prepare it
df = pd.read_csv("data/jobs.csv")
jobs = df.copy()
jobs = jobs.rename(columns={'key_id': 'job_id'})
jobs = jobs[['job_id', 'job_title_short', 'job_title', 'job_location', 'job_schedule_type', 'company_name', 'job_type_skills']]
jobs.dropna(inplace=True)

# Preprocessing the jobs data
jobs['job_title_short'] = jobs['job_title_short'].str.replace(" ", "")
jobs['job_title'] = jobs['job_title'].str.replace(" ", "")
jobs['job_title'] = jobs['job_title_short'].astype(str) + " " + jobs['job_title'].astype(str)
jobs['job_title'] = jobs['job_title'].apply(lambda x: x.split(" "))
jobs = jobs.drop('job_title_short', axis=1)
jobs['job_location'] = jobs['job_location'].apply(lambda x: x.split(","))
jobs['company_name'] = jobs['company_name'].str.replace(" ", "")
jobs['job_schedule_type'] = jobs['job_schedule_type'].apply(lambda x: x.split())
jobs['company_name'] = jobs['company_name'].apply(lambda x: [x])
for col in ['job_title', 'company_name', 'job_location', 'job_schedule_type']:
    jobs[col] = jobs[col].apply(lambda x: [i.lower() for i in x])

# Extract values from dictionaries in 'job_type_skills'
def extract_values(x):
    try:
        list_of_lists = list(ast.literal_eval(x).values())
        return [item for sublist in list_of_lists for item in sublist]
    except (ValueError, SyntaxError):
        return []

jobs['job_type_skills'] = jobs['job_type_skills'].apply(extract_values)

newdf = jobs[['job_id', 'job_type_skills']].copy()
newdf['job_type_skills'] = newdf['job_type_skills'].apply(lambda x: " ".join([str(i) for i in x]))

copydf = jobs.copy()
newdf = newdf.reset_index(drop=True)
copydf = copydf.reset_index(drop=True)

# Step 1: Apply the CountVectorizer on the 'tags' column with max_features and stop_words
cv = CountVectorizer(max_features=5000, stop_words='english')
vectors = cv.fit_transform(newdf['job_type_skills'])

# Step 2: Use NearestNeighbors to find the k-nearest neighbors
knn = NearestNeighbors(n_neighbors=12, metric='cosine', algorithm='brute')
knn.fit(vectors)

# Function to recommend jobs based on skills
def recommend(skills):
    try:
        # Convert the input skills to a vector, ignoring whitespace and case
        skills_vector = cv.transform([''.join(skills.lower().split())])

        # Calculate the distances to all job_type_skills vectors in newdf
        distances, indices = knn.kneighbors(skills_vector, n_neighbors=6)

        # Return the top 5 recommendations from copydf
        recommended_jobs = []
        for i in indices[0][1:]:
            job_id = newdf.iloc[i].job_id
            recommended_job = copydf[copydf['job_id'] == job_id].to_dict('records')[0]
            recommended_jobs.append(recommended_job)
        return recommended_jobs

    except Exception as e:
        return f"Error: {str(e)}"

# Flask API to recommend jobs based on skills
def recommend_jobs():
    try:
        data = request.json
        user_skills = data.get('skills', '')

        if not user_skills:
            return jsonify({"error": "No skills provided"}), 400

        recommendations = recommend(user_skills)
        # Fetch all columns from the original dataframe for the recommended jobs
        detailed_recommendations = []
        for rec in recommendations:
            job_id = rec['job_id']
            detailed_job = df[df['key_id'] == job_id].to_dict('records')[0]
            detailed_recommendations.append(detailed_job)
        return jsonify(detailed_recommendations)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
