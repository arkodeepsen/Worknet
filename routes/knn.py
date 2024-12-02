from flask import Flask, jsonify, request
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.neighbors import NearestNeighbors
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the preprocessed data
df = pd.read_csv("data/jobs.csv")
# Assume preprocessing steps here, as already done in knn.py

jobs=df.copy()
jobs = jobs[jobs['job_country'] == 'India']
jobs = jobs.rename(columns={'key_id': 'job_id'})

jobs = jobs[['job_id','job_title_short', 'job_title' , 'job_location' , 'job_schedule_type', 'company_name', 'job_type_skills']]
jobs.shape

jobs.dropna(inplace=True)
jobs.isnull().sum()

# Remove whitespace from 'job_title_short' and 'job_title' columns
jobs['job_title_short'] = jobs['job_title_short'].str.replace(" ", "")
jobs['job_title'] = jobs['job_title'].str.replace(" ", "")

# Combine 'job_title_short' and 'job_title' into a new 'job_title' column
# Convert the columns to strings explicitly to handle potential missing values
jobs['job_title'] = jobs['job_title_short'].astype(str) + " " + jobs['job_title'].astype(str)
# Convert the 'job_title' column to a list of strings
jobs['job_title'] = jobs['job_title'].apply(lambda x: x.split(" "))
# Drop the 'job_title_short' column
jobs = jobs.drop('job_title_short', axis=1)

#preprocessing the joblocation and company_name and job_schedule_type
jobs['job_location'] = jobs['job_location'].apply(lambda x: x.split(","))
# Remove whitespace from 'company_name' column
jobs['company_name'] = jobs['company_name'].str.replace(" ", "")
# Convert 'job_schedule_type' into a list of strings
jobs['job_schedule_type'] = jobs['job_schedule_type'].apply(lambda x: x.split())

# Convert 'company_name' to a list of strings with single string elements
jobs['company_name'] = jobs['company_name'].apply(lambda x: [x])
# prompt: convert all the columns except job_type_skills into lowercase(they are present as list of string)
# Convert all the columns except job_type_skills into lowercase
for col in ['job_title', 'company_name','job_location', 'job_schedule_type']:
  jobs[col] = jobs[col].apply(lambda x: [i.lower() for i in x])

import ast
# Preprocessing the jobtypeskills
# Extract values from dictionaries in 'job_type_skills' column and flatten the list
def extract_values(x):
  try:
    # Use ast.literal_eval for safer evaluation
    list_of_lists = list(ast.literal_eval(x).values())
    # Flatten the list of lists
    return [item for sublist in list_of_lists for item in sublist]
  except (ValueError, SyntaxError):
    return []  # Return an empty list if evaluation fails

jobs['job_type_skills'] = jobs['job_type_skills'].apply(extract_values)
jobs.head()

copydf=jobs.copy()
copydf.head()

# Combine all columns except 'company_name' into a new 'tags' column
jobs['tags'] = jobs['company_name']+jobs['job_title'] + jobs['job_location'] + jobs['job_schedule_type']  + jobs['job_type_skills']
newdf=jobs[['job_id','tags']]
# Convert all items in the list to strings before joining
newdf['tags']=newdf['tags'].apply(lambda x:" ".join([str(i) for i in x]))

newdf['tags']=newdf['tags'].apply(lambda x:x.lower())

newdf = newdf.reset_index(drop=True)
copydf = copydf.reset_index(drop=True)

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.neighbors import NearestNeighbors

# Step 1: Apply the CountVectorizer on the 'tags' column with max_features and stop_words
cv = CountVectorizer(max_features=5000, stop_words='english')
vectors = cv.fit_transform(newdf['tags'])

# Step 2: Use NearestNeighbors to find the k-nearest neighbors
knn = NearestNeighbors(n_neighbors=25, metric='cosine', algorithm='brute')
knn.fit(vectors)

newdf.head()

# Create the recommendation function
def recommend(job_id):
    try:
        index = newdf[newdf['job_id'] == job_id].index[0]
        distances, indices = knn.kneighbors(vectors[index], n_neighbors=21)
        recommendations = [int(copydf.iloc[i].job_id) for i in indices[0][1:]]
        return recommendations
    except IndexError:
        return []

def get_similar_jobs(job_id):
  recommendations = recommend(job_id)
  job = df[df['key_id'].isin(recommendations)]  # Fetch from the original CSV
  
  if job.empty:
    return jsonify({"error": "Job not found"}), 404
  
  job_details = job.to_dict('records')
  return jsonify(job_details)
