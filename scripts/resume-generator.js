document.addEventListener('DOMContentLoaded', function() {
// Function to initialize Awesomplete
function initializeAwesomplete() {
    fetch('/data/job-titles.txt')
        .then(response => response.text())
        .then(data => {
            // Split the data by comma and trim whitespace
            const jobTitles = Array.from(new Set(data.split(',').map(title => title.trim())));
            console.log("Awesomplete #job-titles initialized");
            // Initialize Awesomplete for all job title inputs
            document.querySelectorAll('#job-title').forEach(input => {
                new Awesomplete(input, {
                    list: jobTitles,
                    minChars: 3,
                    maxItems: 10,
                    autoFirst: true
                });
            });
        })
        .catch(error => console.error('Error fetching job titles:', error));
    fetch('/data/companies.txt')
        .then(response => response.text())
        .then(data => {
            // Split the data by comma and trim whitespace
            const employer = Array.from(new Set(data.split(',').map(title => title.trim())));
            console.log("Awesomplete #employer initialized");
            // Initialize Awesomplete for all job title inputs
            document.querySelectorAll('#employer').forEach(input => {
                new Awesomplete(input, {
                    list: employer,
                    minChars: 2,
                    maxItems: 10,
                    autoFirst: true
                });
            });
        })
        .catch(error => console.error('Error fetching job titles:', error));
}

function institutionInit(){
    const institutionInput = document.getElementById('institution');

    function fetchCSV(url) {
        return fetch(url)
            .then(response => response.text())
            .then(data => {
                return new Promise((resolve, reject) => {
                    Papa.parse(data, {
                        header: true,
                        skipEmptyLines: true,
                        complete: function(results) {
                            const institutions = results.data.map(row => {
                                const university = row['University Name'] ? row['University Name'].replace(/"/g, '').trim() : '';
                                const college = row['College Name'] ? row['College Name'].replace(/"/g, '').trim() : '';
                                return `${college}, ${university}`; // Combine College and University
                            }).filter(institution => institution !== ', '); // Filter out any empty values
                            resolve(institutions);
                        },
                        error: function(error) {
                            reject(error);
                        }
                    });
                });
            });
    }

    function initializeAwesomplete2(list) {
        new Awesomplete(institutionInput, {
            list: list,
            minChars: 1,
            maxItems: 10,
            autoFirst: true
        });
    }

    // Fetch and initialize institutions
    fetchCSV('/data/institutions.csv')
        .then(institutions => {
            console.log("Awesomplete institutions initialized");
            initializeAwesomplete2(institutions);
        })
        .catch(error => console.error('Error fetching institutions:', error));
    }

    function degreesInit() {
        const degreeInput = document.getElementById('educationDegree');
    
        function fetchDegrees(url) {
            return fetch(url)
                .then(response => response.text())
                .then(data => {
                    const degrees = data.split('-').map(degree => degree.trim()).filter(degree => degree !== '');
                    return degrees;
                });
        }
    
        function initializeDegreeAwesomplete(list) {
            new Awesomplete(degreeInput, {
                list: list,
                minChars: 1,
                maxItems: 10,
                autoFirst: true,
                filter: function(text, input) {
                    // Remove spaces and dots from the input
                    const normalizedInput = input.replace(/[\s.]/g, '').toLowerCase();
                    // Remove spaces and dots from the text
                    const normalizedText = text.replace(/[\s.]/g, '').toLowerCase();
                    return normalizedText.includes(normalizedInput);
                },
                item: function(text, input) {
                    // Highlight the matched part
                    const normalizedInput = input.replace(/[\s.]/g, '').toLowerCase();
                    const normalizedText = text.replace(/[\s.]/g, '').toLowerCase();
                    const index = normalizedText.indexOf(normalizedInput);
                    if (index === -1) {
                        return Awesomplete.ITEM(text, input);
                    }
                    const highlightedText = text.substring(0, index) + '<mark>' + text.substring(index, index + normalizedInput.length) + '</mark>' + text.substring(index + normalizedInput.length);
                    return Awesomplete.ITEM(highlightedText, input);
                }
            });
        }
    
        // Fetch and initialize degrees
        fetchDegrees('/data/degrees.txt')
            .then(degrees => {
                console.log("Awesomplete degrees initialized");
                initializeDegreeAwesomplete(degrees);
            })
            .catch(error => console.error('Error fetching degrees:', error));
    }

    function streaminit() {
        const specializationInput = document.getElementById('specialization');
    
        function fetchCSV(url) {
            return fetch(url)
                .then(response => response.text())
                .then(data => {
                    return new Promise((resolve, reject) => {
                        Papa.parse(data, {
                            header: true,
                            skipEmptyLines: true,
                            complete: function(results) {
                                const specializations = results.data.map(row => {
                                    return row['CIPTitle'] ? row['CIPTitle'].replace(/\.$/, '').trim() : '';
                                }).filter(title => title);
                                resolve(specializations);
                            },
                            error: function(error) {
                                reject(error);
                            }
                        });
                    });
                });
        }
    
        function initializeSpecializationAwesomplete(list) {
            new Awesomplete(specializationInput, {
                list: list,
                minChars: 1,
                maxItems: 10,
                autoFirst: true
            });
        }
    
        // Fetch and initialize specializations
        fetchCSV('/data/streams.csv')
            .then(specializations => {
                console.log("Awesomplete specializations initialized");
                initializeSpecializationAwesomplete(specializations);
            })
            .catch(error => console.error('Error fetching specializations:', error));
    }

    function locationInit() {
        const locationInputs = document.querySelectorAll('#location');
    
        function fetchLocations(query) {
            return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    return data.map(place => place.display_name);
                });
        }
    
        locationInputs.forEach(locationInput => {
            const awesomplete = new Awesomplete(locationInput, {
                minChars: 1,
                maxItems: 10,
                autoFirst: true
            });
    
            let debounceTimeout;
    
            locationInput.addEventListener('input', function() {
                const query = locationInput.value.trim();
    
                clearTimeout(debounceTimeout);
    
                if (query.length >= 1) {
                    debounceTimeout = setTimeout(() => {
                        fetchLocations(query)
                            .then(locations => {
                                awesomplete.list = locations;
                            })
                            .catch(error => console.error('Error fetching locations:', error));
                    }, 300); // Delay of 300ms
                } else {
                    awesomplete.list = []; // Clear suggestions if query is empty
                }
            });
    
            // Prevent input box from losing focus
            locationInput.addEventListener('awesomplete-open', function() {
                locationInput.focus();
            });
        });
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('User is not logged in. userId is missing.');
        return;
    }
    // Function to fill experience fields
    function fillExperience(experience) {
        if (experience && experience.length > 0) {
            const experienceEntries = document.getElementById('experience-entries');
            experienceEntries.innerHTML = ''; // Clear existing entries

            experience.forEach(exp => {
                const newEntry = document.createElement('div');
                newEntry.classList.add('experience-entry');
                newEntry.innerHTML = `
                    <div class="form-group">
                        <label for="job-title">Job Title *</label>
                        <input type="text" id="job-title" class="awesomplete" name="jobTitle[]" value="${exp.jobTitle}" required>
                    </div>
                    <div class="form-group">
                        <label for="employer">Employer *</label>
                        <input type="text" id="employer" class="awesomplete" name="employer[]" value="${exp.employer}" required>
                    </div>
                    <div class="form-group">
                        <label for="location">Location *</label>
                        <input type="text" id="location" name="location[]" value="${exp.location}" required>
                    </div>
                    <div class="form-group">
                        <label for="start-date">Start Date *</label>
                        <input type="month" id="start-date" name="startDate[]" value="${exp.startDate}" required>
                    </div>
                    <div class="form-group">
                        <label for="end-date">End Date</label>
                        <input type="month" name="endDate[]" class="end-date">
                    </div>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" name="currentWork[]" class="current-work-checkbox" ${exp.currentWork ? 'checked' : ''}>
                        <label for="current-work">I currently work here</label>
                    </div>
                `;
                experienceEntries.appendChild(newEntry);
            });
        }
        initializeAwesomplete();
        locationInit();
    }
    // Function to fill education fields
    function fillEducation(education) {
        if (education && education.length > 0) {
            const educationEntries = document.getElementById('education-entries');
            educationEntries.innerHTML = ''; // Clear existing entries

            education.forEach(edu => {
                const newEntry = document.createElement('div');
                newEntry.classList.add('education-entry');
                newEntry.innerHTML = `
                    <div class="form-group">
                        <label for="degree">Degree *</label>
                        <input type="text" id="educationDegree" name="educationDegree[]" value="${edu.degree || ''}" required />
                    </div>
                    <div class="form-group">
                        <label for="specialization">Specialization *</label>
                        <input type="text" id="specialization" name="specialization[]" value="${edu.specialization || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="institution">Institution *</label>
                        <input type="text" id="institution" name="institution[]" value="${edu.institution}" required>
                    </div>
                    <div class="form-group">
                        <label for="graduation-year">Graduation Year *</label>
                        <input type="number" name="graduationYear[]" value="${edu.graduationYear}" min="1900" max="2100" required>
                    </div>
                `;
                educationEntries.appendChild(newEntry);
            });
        }
        institutionInit();
        degreesInit();
        streaminit();
    }
    let parts = [];
    // Fetch resume details
    fetch(`/resume/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.resume) {
                console.log(data);
                document.getElementById('first-name').value = data.resume.firstName || '';
                document.getElementById('surname').value = data.resume.lastName || '';
                document.getElementById('country').value = data.resume.country || '';
                document.getElementById('city').value = data.resume.city || '';
                document.getElementById('pin-code').value = data.resume.pinCode || '';
                document.getElementById('phone').value = data.resume.contact || '';
                document.getElementById('email').value = data.resume.email || '';

                // Fetch experience details using resumeId
                const resumeId = data.resume.id;
                fetch(`/experience/${resumeId}`)
                    .then(response => response.json())
                    .then(expData => {
                        if (expData.success && expData.experience) {
                            console.log(expData);
                            fillExperience(expData.experience);
                        }
                    })
                    .catch(error => console.error('Error fetching experience details:', error));

                    // Fetch education details using resumeId
                fetch(`/education/${resumeId}`)
                .then(response => response.json())
                .then(eduData => {
                    if (eduData.success && eduData.education) {
                        console.log(eduData);
                        fillEducation(eduData.education);
                    }
                })
                .catch(error => console.error('Error fetching education details:', error));
            } else {
    fetch(`/get-user-details/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                parts = data.city.split(',');
                console.log(data);
                document.getElementById('first-name').value = data.firstName || '';
                document.getElementById('surname').value = data.lastName || '';
                document.getElementById('country').value = parts.pop().trim() || '';
                document.getElementById('city').value = parts.join(",").trim() || '';
                document.getElementById('pin-code').value = data.pinCode || '';
                document.getElementById('phone').value = data.contact || '';
                document.getElementById('email').value = data.email || '';
            }
        })
        .catch(error => console.error('Error fetching user details:', error));
}
})
.catch(error => console.error('Error fetching resume details:', error));
        document.getElementById('next-btn').addEventListener('click', function(event) {
            const form = document.getElementById('personal-info-form');
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                form.reportValidity();
            } else {
                showPage('step-4');
            }
        });
})

function generateJobDescription() {
    const jobTitle = document.getElementById('job-title-ai').value;

    if (!jobTitle) {
        alert('Please enter a job title.');
        return;
    }

    // Show the loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    loadingOverlay.classList.remove('hidden');

    // Switch the loading text
    const loadingMessages = ['Analyzing.', 'Thinking..', 'Generating...'];
    let messageIndex = 0;
    const loadingInterval = setInterval(() => {
        loadingText.textContent = loadingMessages[messageIndex];
        messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 1000); // Switch text every 1 second

    fetch(`/generate-job-description?jobTitle=${encodeURIComponent(jobTitle)}`)
        .then(response => response.json())
        .then(data => {
            clearInterval(loadingInterval); // Clear the interval
            loadingOverlay.classList.add('hidden'); // Hide the loading overlay

            if (data.success) {
                const jobDescriptionList = document.getElementById('job-description-list');
                jobDescriptionList.innerHTML = ''; // Clear previous results

                const lines = data.description
                    .split(/- /) // Split on "- "
                    .map(line => line.trim())
                    .filter(line => line); // Filter out empty lines

                lines.forEach(line => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('job-description-list-item');

                    const addButton = document.createElement('span');
                    addButton.textContent = '➕';
                    addButton.classList.add('add-button');

                    listItem.appendChild(addButton);
                    listItem.appendChild(document.createTextNode(line));
                    jobDescriptionList.appendChild(listItem);
                });
            } else {
                alert('Failed to generate job description.');
            }
        })
        .catch(err => {
            clearInterval(loadingInterval); // Clear the interval
            loadingOverlay.classList.add('hidden'); // Hide the loading overlay
            console.error('Error generating job description:', err);
            alert('Failed to generate job description. Please try again.');
        });
}

document.getElementById('job-description-list').addEventListener('click', (event) => {
    // Check if the clicked element is the 'Add' button
    if (event.target.classList.contains('add-button')) {
        const listItem = event.target.parentNode;

        // Extract only the description text (excluding the "plus" symbol)
        const line = listItem.childNodes[1].textContent.trim();

        // Add the sliding effect to the line
        listItem.classList.add('slide-left');

        // Wait for the animation to complete before removing the item
        listItem.addEventListener('transitionend', () => {
            listItem.classList.add('hidden');
            setTimeout(() => {
                listItem.remove();
            }, 300); // Delay to allow the collapsing animation

            // Add the line to the editor or wherever it's needed
            addLineToEditor(line);
        });
    }
});

function addLineToEditor(line) {
    // Check if the Quill editor instance is defined
    if (!quill) {
        console.error('Quill editor is not initialized.');
        return;
    }

    // Insert the line as a bullet point
    const currentLength = quill.getLength();
    quill.insertText(currentLength, `\n${line}`);
    quill.formatLine(currentLength + 1, 1, 'list', 'bullet');

    // Scroll to the bottom of the editor to ensure the new bullet point is visible
    const jobDescriptionEditor = document.getElementById('job-description-editor');
    jobDescriptionEditor.scrollTop = jobDescriptionEditor.scrollHeight;

    console.log('Added bullet point to editor:', line);
}

document.addEventListener('DOMContentLoaded', function() {
    var progressBar = document.getElementById('progressValue');
    var progress = 10; // Example progress value

    progressBar.style.width = progress + '%';
    progressBar.textContent = progress + '%';
});

// Navigation between steps
function showPage(pageId) {
    document.querySelectorAll('.step-content').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    updateProgress(pageId);
}

// Progress bar update
function updateProgress(pageId) {
    const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'workHistoryPage2', 'step-5', 'step-6', 'step-7', 'step-8'];
    const currentIndex = steps.indexOf(pageId);
    const progressValue = document.getElementById('progressValue');
    progressValue.style.width = `${((currentIndex + 1) / steps.length) * 100}%`;
}

document.addEventListener('DOMContentLoaded', function() {
    // Function to initialize Awesomplete
    function initializeAwesomplete() {
        fetch('/data/job-titles.txt')
            .then(response => response.text())
            .then(data => {
                // Split the data by comma and trim whitespace
                const jobTitles = Array.from(new Set(data.split(',').map(title => title.trim())));
                console.log("Awesomplete #job-titles initialized");
                // Initialize Awesomplete for all job title inputs
                document.querySelectorAll('#job-title').forEach(input => {
                    new Awesomplete(input, {
                        list: jobTitles,
                        minChars: 3,
                        maxItems: 10,
                        autoFirst: true
                    });
                });
            })
            .catch(error => console.error('Error fetching job titles:', error));
        fetch('/data/companies.txt')
            .then(response => response.text())
            .then(data => {
                // Split the data by comma and trim whitespace
                const employer = Array.from(new Set(data.split(',').map(title => title.trim())));
                console.log("Awesomplete #employer initialized");
                // Initialize Awesomplete for all job title inputs
                document.querySelectorAll('#employer').forEach(input => {
                    new Awesomplete(input, {
                        list: employer,
                        minChars: 2,
                        maxItems: 10,
                        autoFirst: true
                    });
                });
            })
            .catch(error => console.error('Error fetching job titles:', error));
    }

        function locationInit() {
        const locationInputs = document.querySelectorAll('#location');
    
        function fetchLocations(query) {
            return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    return data.map(place => place.display_name);
                });
        }
    
        locationInputs.forEach(locationInput => {
            const awesomplete = new Awesomplete(locationInput, {
                minChars: 1,
                maxItems: 10,
                autoFirst: true
            });
    
            let debounceTimeout;
    
            locationInput.addEventListener('input', function() {
                const query = locationInput.value.trim();
    
                clearTimeout(debounceTimeout);
    
                if (query.length >= 1) {
                    debounceTimeout = setTimeout(() => {
                        fetchLocations(query)
                            .then(locations => {
                                awesomplete.list = locations;
                            })
                            .catch(error => console.error('Error fetching locations:', error));
                    }, 300); // Delay of 300ms
                } else {
                    awesomplete.list = []; // Clear suggestions if query is empty
                }
            });
    
            // Prevent input box from losing focus
            locationInput.addEventListener('awesomplete-open', function() {
                locationInput.focus();
            });
        });
    }

    function check () {
        const currentWorkCheckboxes = document.querySelectorAll('.current-work-checkbox');
        const endDateInputs = document.querySelectorAll('.end-date');

        currentWorkCheckboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', function () {
                if (checkbox.checked) {
                    endDateInputs[index].removeAttribute('required');
                    endDateInputs[index].disabled = true; // Disable the end date input
                    endDateInputs[index].value = ''; // Clear the input if it's checked
                } else {
                    endDateInputs[index].setAttribute('required', 'required');
                    endDateInputs[index].disabled = false; // Enable the end date input
                }
            });
        });
    }

    check();

    // Function to add experience entry
    function addExperienceEntry() {
        const experienceEntries = document.getElementById('experience-entries');
        const newEntry = document.createElement('div');
        newEntry.classList.add('experience-entry');
        newEntry.innerHTML = `
            <div class="form-group">
                <label for="job-title">Job Title *</label>
                <input type="text" id="job-title" class="awesomplete" name="jobTitle[]" placeholder="e.g. Manager" required>
            </div>
            <div class="form-group">
                <label for="employer">Employer *</label>
                <input type="text" id="employer" class="awesomplete" name="employer[]" placeholder="e.g. H&M" required>
            </div>
            <div class="form-group">
                <label for="location">Location</label>
                <input type="text" id="location" class="awesomplete" name="location[]" placeholder="e.g. New Delhi, India" required>
            </div>
            <div class="form-group">
                <label for="start-date">Start Date</label>
                <input type="month" id="start-date" name="startDate[]" required>
            </div>
            <div class="form-group">
                <label for="end-date">End Date</label>
                <input type="month" name="endDate[]" class="end-date" required>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" name="currentWork[]" class="current-work-checkbox">
                <label for="current-work">I currently work here</label>
            </div>
        `;
        experienceEntries.appendChild(newEntry);
        initializeAwesomplete();
        check();
        locationInit();
    }

    // Attach the addExperienceEntry function to the button click event
    document.getElementById('add-experience-button').addEventListener('click', addExperienceEntry);
});
document.addEventListener('DOMContentLoaded', function() {
    function institutionInit() {
        const institutionInputs = document.querySelectorAll('input[name="institution[]"]');

        function fetchCSV(url) {
            return fetch(url)
                .then(response => response.text())
                .then(data => {
                    return new Promise((resolve, reject) => {
                        Papa.parse(data, {
                            header: true,
                            skipEmptyLines: true,
                            complete: function(results) {
                                const institutions = results.data.map(row => {
                                    const university = row['University Name'] ? row['University Name'].replace(/"/g, '').trim() : '';
                                    const college = row['College Name'] ? row['College Name'].replace(/"/g, '').trim() : '';
                                    return `${college}, ${university}`; // Combine College and University
                                }).filter(institution => institution !== ', '); // Filter out any empty values
                                resolve(institutions);
                            },
                            error: function(error) {
                                reject(error);
                            }
                        });
                    });
                });
        }

        function initializeAwesomplete2(list) {
            institutionInputs.forEach(input => {
                new Awesomplete(input, {
                    list: list,
                    minChars: 1,
                    maxItems: 10,
                    autoFirst: true
                });
            });
        }

        // Fetch and initialize institutions
        fetchCSV('/data/institutions.csv')
            .then(institutions => {
                console.log("Awesomplete institutions initialized");
                initializeAwesomplete2(institutions);
            })
            .catch(error => console.error('Error fetching institutions:', error));
    }

    function degreesInit() {
        const degreeInput = document.getElementById('educationDegree');
    
        function fetchDegrees(url) {
            return fetch(url)
                .then(response => response.text())
                .then(data => {
                    const degrees = data.split('-').map(degree => degree.trim()).filter(degree => degree !== '');
                    return degrees;
                });
        }
    
        function initializeDegreeAwesomplete(list) {
            const degreeInputs = document.querySelectorAll('input[name="educationDegree[]"]');
            degreeInputs.forEach(input => {
                new Awesomplete(input, {
                    list: list,
                    minChars: 1,
                    maxItems: 10,
                    autoFirst: true,
                    filter: function(text, input) {
                        // Remove spaces and dots from the input
                        const normalizedInput = input.replace(/[\s.]/g, '').toLowerCase();
                        // Remove spaces and dots from the text
                        const normalizedText = text.replace(/[\s.]/g, '').toLowerCase();
                        return normalizedText.includes(normalizedInput);
                    },
                    item: function(text, input) {
                        // Highlight the matched part
                        const normalizedInput = input.replace(/[\s.]/g, '').toLowerCase();
                        const normalizedText = text.replace(/[\s.]/g, '').toLowerCase();
                        const index = normalizedText.indexOf(normalizedInput);
                        if (index === -1) {
                            return Awesomplete.ITEM(text, input);
                        }
                        const highlightedText = text.substring(0, index) + '<mark>' + text.substring(index, index + normalizedInput.length) + '</mark>' + text.substring(index + normalizedInput.length);
                        return Awesomplete.ITEM(highlightedText, input);
                    }
                });
            });
        }
    
        // Fetch and initialize degrees
        fetchDegrees('/data/degrees.txt')
            .then(degrees => {
                console.log("Awesomplete degrees initialized");
                initializeDegreeAwesomplete(degrees);
            })
            .catch(error => console.error('Error fetching degrees:', error));
    }

    function streaminit() {
        const specializationInputs = document.querySelectorAll('input[name="specialization[]"]');
    
        function fetchCSV(url) {
            return fetch(url)
                .then(response => response.text())
                .then(data => {
                    return new Promise((resolve, reject) => {
                        Papa.parse(data, {
                            header: true,
                            skipEmptyLines: true,
                            complete: function(results) {
                                const specializations = results.data.map(row => {
                                    return row['CIPTitle'] ? row['CIPTitle'].replace(/\.$/, '').trim() : '';
                                }).filter(title => title);
                                resolve(specializations);
                            },
                            error: function(error) {
                                reject(error);
                            }
                        });
                    });
                });
        }
    
        function initializeSpecializationAwesomplete(list) {
            specializationInputs.forEach(input => {
                new Awesomplete(input, {
                    list: list,
                    minChars: 1,
                    maxItems: 10,
                    autoFirst: true
                });
            });
        }
    
        // Fetch and initialize specializations
        fetchCSV('/data/streams.csv')
            .then(specializations => {
                console.log("Awesomplete specializations initialized");
                initializeSpecializationAwesomplete(specializations);
            })
            .catch(error => console.error('Error fetching specializations:', error));
    }

    // Function to add education entry
    function addEducationEntry() {
        const educationEntries = document.getElementById('education-entries');
        const newEntry = document.createElement('div');
        newEntry.classList.add('education-entry');
        newEntry.innerHTML = `
            <div class="form-group">
                <label for="degree">Degree *</label>
                <input type="text" id="educationDegree" name="educationDegree[]" placeholder="Enter your degree" required />
            </div>
            <div class="form-group">
                <label for="specialization">Specialization</label>
                <input type="text" id="specialization" name="specialization[]" placeholder="Select Stream" required>
            </div>
            <div class="form-group">
                <label for="institution">Institution *</label>
                <input type="text" name="institution[]" placeholder="e.g. University of Delhi" required>
            </div>
            <div class="form-group">
                <label for="graduation-year">Graduation Year *</label>
                <input type="number" name="graduationYear[]" min="1900" max="2100" required>
            </div>
        `;
        educationEntries.appendChild(newEntry);
        institutionInit();
        degreesInit();
        streaminit();
    }

    document.getElementById('add-education-button').addEventListener('click', addEducationEntry);
});
function selectTemplate(templateId) {
    document.getElementById('selected-template').value = templateId;
    document.getElementById(templateId).checked = true;
}
// Function to submit the resume form
function submitResume() {
    const personalInfoForm = document.getElementById('personal-info-form');
    const experienceForm = document.getElementById('experience-form');
    const educationForm = document.getElementById('education-form');
    const skillsForm = document.getElementById('skills-form');
    const selectedTemplate = document.getElementById('selected-template').value;

    const formData = new FormData();
    let isValid = true;
    let missingFields = [];

    // Retrieve userId from localStorage or hidden input field
    const userId = localStorage.getItem('userId') || document.getElementById('user-id').value;
    if (!userId) {
        isValid = false;
        missingFields.push('userId');
    }
    formData.append('userId', userId);

    // Helper function to check and append form data
    function checkAndAppendFormData(form) {
        const elements = form.querySelectorAll('input, select, textarea');
        elements.forEach(element => {
            const value = element.value.trim();
            if (element.required && !value) {
                isValid = false;
                missingFields.push(element.name || element.id);
            }
            formData.append(element.name || element.id, value);
        });
    }

    // Check and append data from all forms
    checkAndAppendFormData(personalInfoForm);
    checkAndAppendFormData(experienceForm);
    checkAndAppendFormData(educationForm);
    checkAndAppendFormData(skillsForm);

    // Extract and append the Quill editor content for the summary
    const summaryContent = summaryQuill.root.innerHTML.trim();
    if (summaryContent === '' || summaryContent === '<p><br></p>') {
        isValid = false;
        missingFields.push('summary');
    }
    formData.append('summary', summaryContent);

    // Append experience level
    const experienceLevel = document.getElementById('experience-level').value.trim();
    if (!experienceLevel) {
        isValid = false;
        missingFields.push('experienceLevel');
    }
    formData.append('experienceLevel', experienceLevel);

    // Append selected template
    if (!selectedTemplate) {
        isValid = false;
        missingFields.push('selectedTemplate');
    }
    formData.append('selectedTemplate', selectedTemplate);

    // Append job descriptions
    formData.append('jobDescriptions', JSON.stringify(jobDescriptions));

    // Append Step 8 details
    const step8Forms = [
        'websites-form',
        'certifications-form',
        'languages-form',
        'accomplishments-form',
        'affiliations-form',
        'additional-info-form'
    ];

    step8Forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            checkAndAppendFormData(form);
        }
    });

    // Append profile picture checkbox value
    const enableProfilePic = document.getElementById('enable-profile-pic').checked;
    formData.append('enableProfilePic', enableProfilePic);

    // Check if all required fields are filled
    if (!isValid) {
        showModal('Please fill in all required fields: ' + missingFields.join(', '));
        return;
    }

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    fetch('/submit-resume', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const resumeId = data.resumeId; // Retrieve resumeId from server response
            sessionStorage.setItem('resumeId', resumeId);
            window.location.href = `/preview-resume?resumeId=${resumeId}&template=${selectedTemplate}`;
        } else {
            showModal('Failed to submit resume. Please try again.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to select experience level
function selectExperienceLevel(level) {
    document.getElementById('experience-level').value = level;
    showPage('step-3');
}

// Function to show modal with a message
function showModal(message) {
    const modal = document.getElementById('alertModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('alertModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Initialize the first page
document.addEventListener('DOMContentLoaded', function () {
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    let currentStep = 1;

    // Function to show the current step and hide others
    function showStep(step) {
        stepContents.forEach((content, index) => {
            content.classList.add('hidden');
            steps[index].classList.remove('active');
        });

        document.getElementById(`step-${step}`).classList.remove('hidden');
        steps[step - 1].classList.add('active');
    }

    // Event listeners for navigation buttons
    nextBtns.forEach(btn => btn.addEventListener('click', nextStep));
    prevBtns.forEach(btn => btn.addEventListener('click', prevStep));

    // Event listener for form submission
    const submitBtn = document.querySelector('#step-8 .submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitResume);
    }

    // Fetch and populate user details if userId is available
    const userId = document.querySelector('input[name="userId"]').value;
    if (userId) {
        fetchUserDetails(userId);
    } else {
        // Show the first step initially if no userId is available
        showStep(currentStep);
    }
});
