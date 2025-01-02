# WorkNet - AI-Powered Career & Job Portal

## Overview

WorkNet is a comprehensive platform developed for the Government of Rajasthan as part of SIH2024. The project leverages modern web technologies and integrates advanced AI capabilities to streamline job search and recruitment processes. The backend is powered by Node.js, Express, and Flask, handling functionalities like user authentication, AI-driven features, document generation, and database interactions.

## Features

- **User Authentication**: Secure signup and login with password hashing using `bcrypt` and 2FA with email verification.
- **AI Integration**: Advanced AI functionalities including job recommendations, resume generation, chatbot services, and multimodal features.
- **Dynamic DOCX Generation**: Create personalized documents using `docxtemplater`.
- **Database Management**: Utilize SQLite for efficient data storage and retrieval.
- **CSV Parsing**: Handle large datasets with `csv-parser`.
- **Responsive UI**: Modern and responsive frontend interfaces built with EJS templates.

## Technologies Used

### Backend:

- **Node.js** with Express for server-side logic.
- **Flask** for Python-based API services.
- **SQLite** for the database.
- **Python** for AI models and integration.

### Frontend:

- **EJS Templates** for dynamic rendering.
- **HTML5 & CSS3** for structuring and styling.
- **JavaScript** for frontend logic.

### AI & Machine Learning:

- **Integrated AI services for chatbots, job recommendations, resume analysis, and advanced multimodal features**.
- **Natural Language Processing (NLP)**: For understanding and generating human-like text responses.
- **Computer Vision**: Processing visual data for enhanced user interactions.
- **Multimodal AI Integration**: Combining text, voice, and image data for a richer user experience.

### Libraries & Tools:

- **bcrypt** for password hashing.
- **multer** for file uploads.
- **docxtemplater** for DOCX generation.
- **csv-parser** for CSV handling.
- **helmet** for security enhancements.
- **vanilla-tilt.js** for interactive UI elements.

## Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.x)
- **npm** (Node Package Manager)
- **pip** (Python Package Manager)

### Automatic Setup (Using `worknet.bat`)

1. Run the `worknet.bat` file located in the root directory to automatically install all dependencies and start the servers.

### Manual Setup

1. **Clone the Repository**
   ```
   git clone https://github.com/arkodeepsen/WorkNet.git
   cd WorkNet
   ```

2. **Node.js Setup**
   - **Install Dependencies:**
     ```
     npm install
     ```
   - **Environment Variables:**
     
     Create a `.env` file in the root directory and add the following environment variables:
     ```
     GOOGLE_API_KEY=
     CLOUD_API_KEY=
     GOOGLE_CSE_ID=
     CUSTOM_SEARCH_API=
     HUGGINGFACE_TOKEN=
     SECRET_KEY=
     MAILJET_API_KEY=
     MAILJET_SECRET_KEY=
     EMAIL=
     RECAPTCHA_SECRET_KEY=
     RECAPTCHA_SITE_KEY=
     RAPIDAPI_KEY=
     OPENAI_API_KEY=
     ANTHROPIC_API_KEY=
     BREVO_API_KEY=
     ```
     **Note**: Replace the values with your actual API keys. Do not share these keys publicly.
   - **Start Server:**
     ```
     npm run start
     ```

3. **Python Setup**
   - **Install Virtual Environment** (Optional but recommended):
     ```
     python -m venv venv
     source venv/bin/activate  # On Windows use `venv\Scripts\activate`
     ```
   - **Install Requirements:**
     ```
     pip install -r requirements.txt
     ```
   - **Run Flask Server:**
     ```
     python server.py
     ```

#### 1. Clone the Repository


   ## Directory Structure

   ```
   WorkNet/
   │
   ├── assets/
   │   ├── images/
   │   ├── styles/
   │   └── scripts/
   │
   ├── data/
   │   ├── users.csv
   │   └── jobdata.csv
   │
   ├── views/
   │   ├── signup.ejs
   │   ├── signin.ejs
   │   ├── main.ejs
   │   ├── job-details.ejs
   │   └── resume-generator.ejs
   │
   ├── scripts/
   │   ├── index.js
   │   ├── jobs.js
   │   └── resume.js
   │
   ├── server.js
   ├── server.py
   ├── database.sqlite
   ├── package.json
   ├── requirements.txt
   ├── .env
   └── README.md
   ```

   ## AI Features

   ### 1. Chatbot Service
   **Description**: An interactive chatbot to assist users with queries.  
   **Technologies**: Integrated using Flask and connected to AI services.

   ### 2. Job Recommendation System
   **Description**: Provides personalized job recommendations based on user profiles and preferences.  
   **Technologies**: Implements K-Nearest Neighbors (KNN) algorithm for recommendations.

   ### 3. Resume Analyzer & Generator
   **Description**: Allows users to generate and analyze resumes with AI-driven suggestions.  
   **Technologies**: Utilizes Gemini multimodal models via API integrations.

   ## Common Issues & Fixes

   ### Issue: PowerShell Script Execution Disabled
   **Error Message**:
   ```
nodemon : File C:\Users\username\AppData\Roaming\npm\nodemon.ps1 cannot be loaded because running scripts is disabled on this system. For more information, 
see about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
At line:1 char:1
+ nodemon server.js
+ ~~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
   ```
### Fix:
1. **Open PowerShell as Administrator:**
   - Search for "PowerShell" in your Start menu, right-click on "Windows PowerShell," and select "Run as administrator."

2. **Check the Current Execution Policy:**
   ```powershell
   Get-ExecutionPolicy
   ```
   This command will show you the current execution policy.

3. **Change the Execution Policy:**
   To temporarily change the execution policy to allow scripts to run, use:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   ```
   This change will apply only to the current PowerShell session. If you want to change the policy permanently, you can use:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   or
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
   ```
   The `RemoteSigned` policy allows scripts created on the local computer to run but requires scripts downloaded from the internet to be signed by a trusted publisher.
   **Note**: Adjusting the execution policy affects the security of your system. It's recommended to set the policy scope appropriately to minimize potential risks. For more information, refer to the [Microsoft documentation on PowerShell execution policies](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy).

   ## Useful Commands

   - **Install Node.js Dependencies**:
     ```
     npm install
     ```

   - **Install Python Dependencies**:
     ```
     pip install -r requirements.txt
     ```

   - **Start Servers Concurrently**:
     ```
     npm run start
     ```

   - **Run Servers Individually**:
     - *Node.js Server*:
       ```
       nodemon server.js
       ```
     - *Flask Server*:
       ```
       python server.py
       ```

   ## Additional Information

   - **Database File**: Located at `database.sqlite` in the root directory.
   - **Environment Variables**: Keep your `.env` file secure and never commit it to version control.
   - **API Integrations**: Ensure all API keys are valid and have the necessary permissions.

   ## Links & Resources

   - [Get Google API Key](https://developers.google.com/apis-explorer)
   - [Get Google Cloud API Key](https://cloud.google.com/docs/authentication/api-keys)
   - [OpenAI API Documentation](https://beta.openai.com/docs/)
     
   ## Contact

   For any queries or support, please reach out to the development team at [contact@worknet.publicvm.com](mailto:contact@worknet.publicvm.com).

   © 2024 WorkNet. All rights reserved.
