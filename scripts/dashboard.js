document.addEventListener('DOMContentLoaded', function () {
    // Retrieve the currently logged-in user's ID (ensure it's stored when the user logs in)
    const userId = localStorage.getItem('userId'); // This assumes you store userId in localStorage when the user logs in

    if (!userId) {
        document.getElementById('resume-data').innerHTML = '<p>User is not logged in.</p>';
        return;
    }
    const defaultProfilePic = '/assets/default.jpg';
    // Fetch user details
    fetch(`/get-user-details/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Update profile picture
                const profilePicElement = document.getElementById('dashboard-profile-pic');
                // Check if profilePicture is available and valid
            profilePicElement.src = data.profilePicture 
            ? `${data.profilePicture}` 
            : defaultProfilePic;
            profilePicElement.alt = 'Profile Picture';

            const skills = data.skills || '';

            // Fetch job recommendations using the skills
            fetchJobRecommendations(skills);
            if (data.skills || data.courses || data.languages || data.college || data.stream || data.year || data.type || data.gender || data.contact || data.email || data.firstName || data.lastName || data.city) {
                // Populate the dashboard with user data
                document.getElementById('dashboard-name').innerText = `Name: ${data.firstName} ${data.lastName}`;
                document.getElementById('dashboard-email').innerText = `Email: ${data.email}`;
                document.getElementById('dashboard-phone').innerText = `Phone: ${data.contact}`;
                document.getElementById('dashboard-skills').innerText = `Skills: ${data.skills || 'N/A'}`;
                // Update resume-data section with user details
                document.getElementById('resume-data').innerHTML = `
                    <h2>Personal Information</h2>
                    <p><strong>Name:</strong> ${data.firstName || 'N/A'} ${data.lastName || 'N/A'}</p>
                    <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${data.contact || 'N/A'}</p>
                    <p><strong>Address:</strong> ${data.city || 'N/A'}</p>
                    <p><strong>Gender:</strong> ${data.gender || 'N/A'}</p>
                    <p><strong>Currently:</strong> ${data.type || 'N/A'}</p>
                    <h2>Education</h2>
                    <p><strong>College:</strong> ${data.college || 'N/A'}</p>
                    <p><strong>Stream:</strong> ${data.stream || 'N/A'}</p>
                    <p><strong>Start Year:</strong> ${data.startYear || 'N/A'}</p>
                    <p><strong>End Year:</strong> ${data.endYear || 'N/A'}</p>
                    <h2>Languages</h2>
                    <p>${data.languages || 'N/A'}</p>
                    <h2>Courses</h2>
                    <p>${data.courses || 'N/A'}</p>
                    <h2>Skills</h2>
                    <p>${data.skills || 'N/A'}</p>
                `;
            }
            else{
                document.getElementById('resume-data').innerHTML = '<p>No user details found. Please update your details.</p>';
            }
            } else {
                document.getElementById('resume-data').innerHTML = '<p>No user details found. Please update your details.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
            document.getElementById('resume-data').innerHTML = '<p>Welcome! Please add your details by clicking the button below.</p>';
        });
});

function fetchJobRecommendations(skills) {
    fetch('http://127.0.0.1:5000/recommend-jobs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ skills: skills })
    })
    .then(response => response.json())
    .then(data => {
        const jobResultsDiv = document.getElementById('job-results');

        // Clear previous results
        jobResultsDiv.innerHTML = '';

        if (data.length > 0) {
            data.forEach(job => {
                // Parse job_skills if it's a string
                let skillsArray = [];
                try {
                    skillsArray = JSON.parse(job.job_skills.replace(/'/g, '"'));
                } catch (e) {
                    console.error('Error parsing job_skills:', e);
                }

                const company = job.company_name || 'N/A';
                const title = job.job_title || 'N/A';
                const location = job.job_location || 'N/A';
                const scheduleType = job.job_schedule_type || 'N/A';
                const jobId = job.key_id;

                // Create job card
                const jobCard = document.createElement('div');
                jobCard.classList.add('job-card');
                jobCard.innerHTML = `
                    <h3>${title}</h3>
                    <p><strong>Company:</strong> ${company}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>Type:</strong> ${scheduleType}</p>
                `;

                // Add onclick event to navigate to job details
                jobCard.onclick = () => {
                    window.location.href = `job-details?id=${jobId}`;
                };

                // Append the job card to the job results container
                jobResultsDiv.appendChild(jobCard);
            });
        } else {
            jobResultsDiv.innerHTML = '<p>No job recommendations found.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching job recommendations:', error);
        jobResultsDiv.innerHTML = '<p>Error fetching job recommendations.</p>';
    });
}