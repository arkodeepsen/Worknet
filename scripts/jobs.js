document.addEventListener('DOMContentLoaded', function () {                   
    function performSearch() {
        const skills = searchInput.value;
        searchJobs(skills);
    }

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
});

function showLoadingAnimation(numberOfResults) {
    const loading = document.querySelector('.loading');
    if (loading) {
        // Calculate duration based on the number of results
        const duration = Math.max((numberOfResults / 10) + (numberOfResults / 20), 1); // Ensure minimum duration of 1 second
        loading.style.setProperty('--duration', `${duration}s`);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    let currentPage = 1;
    const pageSize = 50;
    let isSearchActive = false;

    function performSearch(page = 1) {
        const skills = searchInput.value;
        if (skills.trim() === "") {
            fetchFilteredJobs(page, pageSize);
            isSearchActive = false;
        } else {
            searchJobs(skills, page, pageSize);
            isSearchActive = true;
        }
    }

    searchButton.addEventListener('click', () => performSearch(1));

    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            performSearch(1);
        }
    });

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            performSearch(currentPage);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        performSearch(currentPage);
    });

    function updatePagination(totalResults, page, pageSize) {
        const totalPages = Math.ceil(totalResults / pageSize);
        document.getElementById('pageInfo').innerText = `Page ${page} of ${totalPages}`;
        document.getElementById('prevPage').disabled = page <= 1;
        document.getElementById('nextPage').disabled = page >= totalPages;
    }

    function fetchFilteredJobs(page = 1, pageSize = 50) {
        console.log(`Fetching filtered jobs for page: ${page}`);

        fetch(`http://localhost:5000/filtered-jobs?page=${page}&page_size=${pageSize}`)
            .then(response => response.json())
            .then(data => {
                console.log('Received filtered jobs:', data);

                if (!Array.isArray(data.results) || data.results.length === 0) {
                    document.getElementById('jobResults').innerHTML = '<p>No jobs found.</p>';
                    return;
                }

                const jobIds = data.results.map(job => job.job_id);

                // Update the results title with the count
                const resultCount = data.total_results;
                document.getElementById('resultsTitle').innerText = `Showing 50 of ${resultCount} jobs matched for you`;

                if (jobIds.length === 0) {
                    document.getElementById('jobResults').innerHTML = '<p>No jobs found.</p>';
                    return;
                }

                showLoadingAnimation(jobIds.length); // Show loading animation with calculated duration

                fetchJobDetails(jobIds);
                updatePagination(resultCount, page, pageSize);
            })
            .catch(error => console.error('Error fetching filtered jobs:', error));
    }

    function searchJobs(skills, page, pageSize) {
        console.log(`Sending search request for: ${skills}, page: ${page}`);

        // Show loading animation
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.style.display = 'flex'; // Ensure it's visible
        }

        // Show loading spinner
        document.getElementById('jobResults').innerHTML = '<div class="loading"></div>';

        fetch('http://localhost:5000/search-jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills, page, page_size: pageSize })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Received search response:', data);

            // Extract job IDs from the response
            if (!Array.isArray(data.results) || data.results.length === 0) {
                console.error('Invalid search results format:', data);
                document.getElementById('jobResults').innerHTML = '<p>No jobs found.</p>';
                return;
            }

            const jobIds = data.results.map(job => job.job_id);

            // Update the results title with the count
            const resultCount = data.total_results;
            document.getElementById('resultsTitle').innerText = `${resultCount} results found for "${skills}"`;

            if (jobIds.length === 0) {
                document.getElementById('resultsTitle').innerText = `No results found for "${skills}"`;
                document.getElementById('jobResults').innerHTML = '<p>No jobs found.</p>';
                return;
            }

            showLoadingAnimation(jobIds.length); // Show loading animation with calculated duration

            fetchJobDetails(jobIds);
            updatePagination(resultCount, page, pageSize);
        })
        .catch(error => console.error('Error searching jobs:', error));
    }

    function fetchJobDetails(jobIds) {
        const jobResultsContainer = document.getElementById('jobResults');
        jobResultsContainer.innerHTML = ''; // Clear previous results

        if (!Array.isArray(jobIds) || jobIds.length === 0) {
            jobResultsContainer.innerHTML = '<p>No jobs found.</p>';
            // Hide loading animation if no job details
            const loading = document.querySelector('.loading');
            if (loading) loading.style.display = 'none';
            return;
        }

        const requests = jobIds.map(id =>
            fetch(`http://localhost:5000/job-details/${id}`).then(response => response.json())
        );

        Promise.all(requests)
            .then(jobDetailsArray => {
                if (jobDetailsArray.length === 0) {
                    jobResultsContainer.innerHTML = '<p>No jobs found.</p>';
                    // Hide loading animation if no job details
                    const loading = document.querySelector('.loading');
                    if (loading) loading.style.display = 'none';
                    return;
                }

                // Hide loading animation once job details are fetched
                const loading = document.querySelector('.loading');
                if (loading) loading.style.display = 'none';

                jobDetailsArray.forEach(jobDetails => {
                    console.log('Job details:', jobDetails); // Debug log to inspect structure

                    if (jobDetails.error) {
                        console.error(jobDetails.error);
                        return;
                    }

                    // Parse job_skills if it's a string
                    let skillsArray = [];
                    try {
                        // Convert string array to actual array
                        skillsArray = JSON.parse(jobDetails.job_skills.replace(/'/g, '"'));
                    } catch (e) {
                        console.error('Error parsing job_skills:', e);
                    }

                    const jobCard = document.createElement('div');
                    jobCard.classList.add('job-card');
                    jobCard.setAttribute('data-id', jobDetails.key_id); // Use key_id here
                    jobCard.innerHTML = `
                        <div class="job-card-header">
                            <h3>${jobDetails.job_title || 'N/A'}</h3>
                            <p><strong>Company:</strong> ${jobDetails.company_name || 'N/A'}</p>
                        </div>
                        <div class="job-card-body">
                            <p><strong>Location:</strong> ${jobDetails.job_location || 'N/A'}</p>
                            <p><strong>Skills:</strong> ${skillsArray.length > 0 ? skillsArray.join(', ') : 'N/A'}</p>
                            <p><strong>Schedule Type:</strong> ${jobDetails.job_schedule_type || 'N/A'}</p>
                        </div>
                    `;

                    // Add click event to navigate to job-details with the key_id
                    jobCard.addEventListener('click', () => {
                        const jobId = jobCard.getAttribute('data-id');
                        if (jobId) {
                            window.location.href = `job-details?id=${jobId}`;
                        } else {
                            console.error('Job ID is undefined or not set.');
                        }
                    });

                    jobResultsContainer.appendChild(jobCard);
                });
            })
            .catch(error => console.error('Error fetching job details:', error));
    }

    // Initial search on page load
    performSearch(1);
});