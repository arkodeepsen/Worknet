document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/home';
        return;
    }

    const historyCards = document.getElementById('history-cards');

    // Uploading and processing handwritten resumes
    document.getElementById('upload-button').addEventListener('click', () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
    
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);
    
            // Show the loading screen
            const loadingScreen = document.getElementById('loading-screen');
            const loadingText = document.getElementById('loading-text');
            loadingScreen.classList.remove('hidden');
    
            // Cycle the loading text
            const loadingMessages = ['Analyzing', 'Analyzing.', 'Analyzing..', 'Analyzing...', 'Generating...', 'Generating', 'Generating.', 'Generating..', 'Generating...'];
            let messageIndex = 0;
            const loadingInterval = setInterval(() => {
                loadingText.textContent = loadingMessages[messageIndex];
                messageIndex = (messageIndex + 1) % loadingMessages.length;
            }, 3000); // Switch text every 3000ms
    
            fetch('/upload-handwritten', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                clearInterval(loadingInterval); // Clear the interval
                loadingScreen.classList.add('hidden'); // Hide the loading screen
    
                if (data.success) {
                    console.log('Data:', data.text);
                    displayResume(data.text);
                    saveToHistory(userId, data.image, data.text);
                } else {
                    alert('Failed to extract text from the image.');
                }
            })
            .catch(error => {
                clearInterval(loadingInterval); // Clear the interval
                loadingScreen.classList.add('hidden'); // Hide the loading screen
                alert('An error occurred while uploading the file.');
                console.error('Error:', error);
            });
        } else {
            alert('Please select a file to upload.');
        }
    });

// Display formatted resume without modifying original formatting
function displayResume(rawText) {
    const resumePreview = document.getElementById('resume-preview');
    resumePreview.innerHTML = ''; // Clear previous content

    // Omit the first three lines and split the rest into lines
    const lines = rawText.split('\n').slice(3);
    
    // Join the remaining lines into a single string and format it for HTML display
    let resumeHtml = lines.join('<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/#\s*(.*?)(<br>|$)/g, '<h2>$1</h2>') // Heading 1 to <h2>
        .replace(/\*(.*?)\*/g, '<li>$1</li>') // List items
        .replace(/<\/li><br>/g, '</li>') // Close list items without adding new <ul>
        .replace(/<br>/g, '') // Remove extra line breaks
        .replace(/<li>(.*?)<\/li>/g, '<li>$1</li>'); // Finalize list items

    // Wrap <li> items in <ul> tags
    resumeHtml = resumeHtml.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');

    // Remove any remaining markdown symbols
    resumeHtml = resumeHtml.replace(/(<h2>|<\/h2>|<\/ul>|<li>|<\/li>|#|\*)/g, ''); // Remove unwanted tags and symbols

    resumePreview.innerHTML = resumeHtml;
    document.getElementById('result-section').style.display = 'block';
}

    // Save to history
    function saveToHistory(userId, image, text) {
        const card = document.createElement('div');
        card.className = 'history-card';
        
        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.className = 'thumbnail-wrapper';
        
        const img = document.createElement('img');
        img.src = `/uploads/${image}`;
        img.alt = 'Thumbnail';
        img.className = 'thumbnail';
        
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.addEventListener('click', () => displayResume(item.text));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button'; // Class for styling
        deleteButton.innerHTML = '❌';
        deleteButton.addEventListener('click', () => deleteFromHistory(card, userId, item.image));
        
        // Append the thumbnail and delete button to the wrapper
        thumbnailWrapper.append(img, deleteButton);
        card.append(thumbnailWrapper, viewButton);
        historyCards.appendChild(card);        

        // Save to database
        fetch('/save-handwritten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, image, text })
        }).catch(error => console.error('Error saving to history:', error));
    }

    // Delete from history
    function deleteFromHistory(card, userId, image) {
        fetch('/delete-handwritten', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, image })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                card.remove();
            } else {
                alert('Failed to delete from history.');
            }
        })
        .catch(error => console.error('Error deleting from history:', error));
    }

    // Load history on page load
    fetch(`/get-handwritten-history/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.history.forEach(item => {
                    const card = document.createElement('div');
card.className = 'history-card';

const thumbnailWrapper = document.createElement('div');
thumbnailWrapper.className = 'thumbnail-wrapper';

const img = document.createElement('img');
img.src = `/uploads/${item.image}`;
img.alt = 'Thumbnail';
img.className = 'thumbnail';

const viewButton = document.createElement('button');
viewButton.textContent = 'View';
viewButton.addEventListener('click', () => displayResume(item.text));

const deleteButton = document.createElement('button');
deleteButton.className = 'delete-button'; // Class for styling
deleteButton.innerHTML = '❌';
deleteButton.addEventListener('click', () => deleteFromHistory(card, userId, item.image));

// Append the thumbnail and delete button to the wrapper
thumbnailWrapper.append(img, deleteButton);
card.append(thumbnailWrapper, viewButton);
historyCards.appendChild(card);
                });
            }
        })
        .catch(error => console.error('Error fetching history:', error));
});
