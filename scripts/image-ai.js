document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/home';
        return;
    }

    const historyCards = document.getElementById('history-cards');

    document.getElementById('upload-button').addEventListener('click', async () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);

            try {
                const response = await fetch('/upload-image', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                console.log(result);

                if (result.success) {
                    const processedImagePath = result.processedImagePath;
                    console.log('Image enhanced successfully.');
                    document.getElementById('result-section').style.display = 'block';
                    displayImage(processedImagePath);
                    saveToHistory(userId, processedImagePath);
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while enhancing the image.');
            }
        } else {
            alert('Please select a file to upload.');
        }
    });

    function displayImage(imageUrl) {
        const imagePreview = document.getElementById('image-preview');
        imagePreview.innerHTML = ''; // Clear previous content

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Enhanced Image';
        img.style.width = '100%';
        img.style.borderRadius = '8px';

        imagePreview.appendChild(img);
    }

    function saveToHistory(userId, imageUrl) {
        console.log('Saving to history:', { userId, imageUrl });
        // Create a new card for the history section
        const card = document.createElement('div');
        card.className = 'history-card';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Thumbnail';
        img.className = 'thumbnail';

        const button = document.createElement('button');
        button.textContent = 'View';
        button.addEventListener('click', () => {
            displayImage(imageUrl);
        });

        card.appendChild(img);
        card.appendChild(button);
        historyCards.appendChild(card);
    }

    // Fetch and display previous generations
    fetch(`/get-image-history/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Fetched history successfully:', data.history);
                data.history.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'history-card';

                    const img = document.createElement('img');
                    img.src = item.processedImagePath;
                    img.alt = 'Thumbnail';
                    img.className = 'thumbnail';

                    const button = document.createElement('button');
                    button.textContent = 'View';
                    button.addEventListener('click', () => {
                        displayImage(item.processedImagePath);
                    });

                    card.appendChild(img);
                    card.appendChild(button);
                    historyCards.appendChild(card);
                });
            } else {
                console.error('Failed to fetch history.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});