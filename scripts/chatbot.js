(function () {
  // Check if user is logged in
const userId = localStorage.getItem('userId');
if (!userId) {
  setTimeout(() => {
    // Create the popup container
    var popupContainer = document.createElement('div');
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '50%';
    popupContainer.style.left = '50%';
    popupContainer.style.transform = 'translate(-50%, -50%)';
    popupContainer.style.width = '400px'; // Increased width
    popupContainer.style.padding = '30px'; // Increased padding
    popupContainer.style.backgroundColor = '#fff';
    popupContainer.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.3)'; // Enhanced shadow
    popupContainer.style.borderRadius = '15px'; // More rounded corners
    popupContainer.style.textAlign = 'center';
    popupContainer.style.zIndex = '10000';
    popupContainer.style.fontFamily = 'Arial, sans-serif';

    // Create the popup message
    var popupMessage = document.createElement('p');
    popupMessage.textContent = 'Please log in to access job search portal and the career counselor chatbot.';
    popupMessage.style.fontSize = '18px'; // Increased font size
    popupMessage.style.color = '#333';
    popupMessage.style.marginBottom = '20px';

    // Create the close button
    var closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '12px 25px'; // Increased padding
    closeButton.style.backgroundColor = '#0056b3';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px'; // Increased font size
    closeButton.style.transition = 'background-color 0.3s, transform 0.3s'; // Smooth transitions

    // Hover effect for the button
    closeButton.onmouseover = function() {
      closeButton.style.backgroundColor = '#004494';
      closeButton.style.transform = 'scale(1.05)';
    };
    closeButton.onmouseout = function() {
      closeButton.style.backgroundColor = '#0056b3';
      closeButton.style.transform = 'scale(1)';
    };

    // Append message and button to the popup container
    popupContainer.appendChild(popupMessage);
    popupContainer.appendChild(closeButton);

    // Append the popup container to the body
    document.body.appendChild(popupContainer);

    // Close the popup on button click
    closeButton.addEventListener('click', function() {
      document.body.removeChild(popupContainer);
    });
  }, 2000); // 1 second delay
  return;  // Stop the script if the user is not logged in
}

// Function to fetch user details from the database
  async function fetchUserDetails(userId) {
    try {
      const response = await fetch(`/get-user-details/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }

  // Function to show the modal alert
    function showModal(message) {
    // Create the popup container
    var popupContainer = document.createElement('div');
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '50%';
    popupContainer.style.left = '50%';
    popupContainer.style.transform = 'translate(-50%, -50%)';
    popupContainer.style.width = '400px'; // Increased width
    popupContainer.style.padding = '30px'; // Increased padding
    popupContainer.style.backgroundColor = '#fff';
    popupContainer.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.3)'; // Enhanced shadow
    popupContainer.style.borderRadius = '15px'; // More rounded corners
    popupContainer.style.textAlign = 'center';
    popupContainer.style.zIndex = '10000';
    popupContainer.style.fontFamily = 'Arial, sans-serif';
  
    // Create the popup message
    var popupMessage = document.createElement('p');
    popupMessage.textContent = message;
    popupMessage.style.fontSize = '18px'; // Increased font size
    popupMessage.style.color = '#333';
    popupMessage.style.marginBottom = '20px';
  
    // Create the close button
    var closeButton = document.createElement('button');
    closeButton.textContent = 'Go to Dashboard';
    closeButton.style.padding = '12px 25px'; // Increased padding
    closeButton.style.backgroundColor = '#0056b3';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px'; // Increased font size
    closeButton.style.transition = 'background-color 0.3s, transform 0.3s'; // Smooth transitions
  
    // Hover effect for the button
    closeButton.onmouseover = function() {
      closeButton.style.backgroundColor = '#004494';
      closeButton.style.transform = 'scale(1.05)';
    };
    closeButton.onmouseout = function() {
      closeButton.style.backgroundColor = '#0056b3';
      closeButton.style.transform = 'scale(1)';
    };
  
    // Append message and button to the popup container
    popupContainer.appendChild(popupMessage);
    popupContainer.appendChild(closeButton);
  
    // Append the popup container to the body
    document.body.appendChild(popupContainer);
  
    // Redirect to dashboard on button click
    closeButton.addEventListener('click', function() {
      window.location.href = '/dashboard';
    });
  }
  
// Variables to store username and profile picture
let username = localStorage.getItem('username') || 'You';  // Default to 'You' if not found
let profilePicture = localStorage.getItem('profilePicture') || 'assets/default.jpg';  // Default profile picture

// Fetch the logged-in user's details (username and profile picture)
fetch(`/get-username/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
              username = data.username || 'You';  // Default to 'You' if username is not available
              console.log('Username fetched:', username);
            }
        })
        .catch(error => {
          console.error('Error fetching username:', error);
        });
fetch(`/get-user-details/${userId}`)
    .then(response => response.json())
    .then(data => {
        if (data) {
            profilePicture = data.profilePicture || 'assets/default.jpg';  // Set default profile picture
            console.log('User picture fetched:', profilePicture);
        }
    })
    .catch(error => {
        console.error('Error fetching profile picture:', error);
    });

  console.log("Chatbot script is running");
  var greetingSent = false; // Flag to check if greeting has been sent
  // Check if dark mode is enabled
 // Dark mode handling
let darkMode = localStorage.getItem('darkMode');
let isDarkMode = darkMode === 'enabled';

// Ensure font color remains black even in dark mode
if (isDarkMode) {
  document.body.style.color = '#000000';
}

  // Create the chatbot button
  var chatbotButton = document.createElement('div');
  chatbotButton.id = 'chatbot-button';
  chatbotButton.style.position = 'fixed';
  chatbotButton.style.bottom = '20px';
  chatbotButton.style.right = '20px';
  chatbotButton.style.width = '60px';
  chatbotButton.style.height = '60px';
  chatbotButton.style.backgroundColor = '#0056b3';
  chatbotButton.style.borderRadius = '50%';
  chatbotButton.style.display = 'flex';
  chatbotButton.style.justifyContent = 'center';
  chatbotButton.style.alignItems = 'center';
  chatbotButton.style.color = '#fff';
  chatbotButton.style.cursor = 'pointer';
  chatbotButton.style.fontSize = '24px';
  chatbotButton.style.boxShadow = '0px 4px 8px rgba(0,0,0,0.2)';
  chatbotButton.style.backgroundImage = 'url("chatbot/T0fK.gif")';
  chatbotButton.style.backgroundSize = '125%';
  chatbotButton.style.backgroundPosition = 'center';
  chatbotButton.innerHTML = '&#128172;'; // Chat bubble icon
  chatbotButton.style.display = 'flex';
  chatbotButton.style.justifyContent = 'center';
  chatbotButton.style.alignItems = 'center';
  chatbotButton.style.transition = 'background-color 0.3s, transform 0.3s';
  
  // Hover effect
  chatbotButton.onmouseover = function() {
    chatbotButton.style.backgroundColor = '#00458f';
    chatbotButton.style.transform = 'scale(1.1)';
  };
  chatbotButton.onmouseout = function() {
    chatbotButton.style.backgroundColor = '#0056b3';
    chatbotButton.style.transform = 'scale(1)';
  };

  // Append button to the body
  document.body.appendChild(chatbotButton);
  console.log("Chatbot button appended to the body");

  // Create the expanded chat container
  var chatbotContainer = document.createElement('div');
  chatbotContainer.id = 'chatbot-container';
  chatbotContainer.style.position = 'fixed';
  chatbotContainer.style.bottom = '80px';
  chatbotContainer.style.right = '20px';
  chatbotContainer.style.width = '400px'; // Slightly wider
  chatbotContainer.style.height = '500px';
  chatbotContainer.style.background = 'rgba(255, 255, 255, 0.9)'; // Glass finish
  chatbotContainer.style.border = '1px solid rgba(0, 0, 0, 0.1)';
  chatbotContainer.style.boxShadow = '0px 8px 16px rgba(0,0,0,0.2)';
  chatbotContainer.style.display = 'none'; // Hidden initially
  chatbotContainer.style.flexDirection = 'column';
  chatbotContainer.style.zIndex = '9999';
  chatbotContainer.style.borderRadius = '15px';
  chatbotContainer.style.overflow = 'hidden';
  chatbotContainer.style.backdropFilter = 'blur(10px)'; // Glass effect

// iPhone-style header
var chatbotHeader = document.createElement('div');
chatbotHeader.style.backgroundColor = '#d9c4f8';
chatbotHeader.style.color = '#0056b3';
chatbotHeader.style.padding = '15px';
chatbotHeader.style.textAlign = 'center';
chatbotHeader.style.fontWeight = 'bold';
chatbotHeader.style.position = 'relative'; // Ensure relative positioning for dropdown

const imageSrc = 'assets/ai.png';

// Dropdown button
var dropdownButton = document.createElement('button');
dropdownButton.innerHTML = `<img src="${imageSrc}" alt="Icon" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 0px;"> WorkNet AI &#x25BE;`; // Default to WorkNet AI with dropdown arrow and image
dropdownButton.style.background = 'transparent';
dropdownButton.style.border = 'none';
dropdownButton.style.fontSize = '18px';
dropdownButton.style.color = '#0056b3';
dropdownButton.style.fontWeight = 'bold';
dropdownButton.style.cursor = 'pointer';
dropdownButton.style.transition = 'color 0.3s';
dropdownButton.style.position = 'relative'; // Ensure relative positioning for dropdown

dropdownButton.onmouseover = function() {
  dropdownButton.style.color = '#00458f';
};
dropdownButton.onmouseout = function() {
  dropdownButton.style.color = '#0056b3';
};

// Dropdown menu
var dropdownMenu = document.createElement('div');
dropdownMenu.className = 'dropdownmenu';
dropdownMenu.style.position = 'absolute';
dropdownMenu.style.top = '100%'; // Position below the button
dropdownMenu.style.backgroundColor = 'rgba(244, 221, 253, 0.8)';
dropdownMenu.style.border = '1px solid #ccc';
dropdownMenu.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.15)';
dropdownMenu.style.display = 'none';
dropdownMenu.style.zIndex = '1000';
dropdownMenu.style.width = '100%';

// Dropdown options
var worknetAIOption = document.createElement('div');
worknetAIOption.className = 'dropdown-option';
worknetAIOption.innerHTML = 'WorkNet AI<br><small>with gemini-1.5-pro</small>';
worknetAIOption.style.padding = '10px';
worknetAIOption.style.cursor = 'pointer';
worknetAIOption.style.background = 'rgba(0, 0, 0, 0.1)'; // Highlight the selected option

var worknetAdvancedAIOption = document.createElement('div');
worknetAdvancedAIOption.className = 'dropdown-option';
worknetAdvancedAIOption.innerHTML = 'WorkNet Advanced AI<br><small>with claude-3.5-sonnet</small>';
worknetAdvancedAIOption.style.padding = '10px';
worknetAdvancedAIOption.style.cursor = 'pointer';

worknetAIOption.addEventListener('click', function() {
  dropdownButton.innerHTML = `<img src="${imageSrc}" alt="Icon" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"> WorkNet AI &#x25BE;`;
  worknetAIOption.style.background = 'rgba(0, 0, 0, 0.1)';
  worknetAdvancedAIOption.style.background = 'transparent';
  dropdownMenu.style.display = 'none';
});

worknetAdvancedAIOption.addEventListener('click', function() {
  dropdownButton.innerHTML = `<img src="${imageSrc}" alt="Icon" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"> WorkNet Advanced AI &#x25BE;`;
  worknetAdvancedAIOption.style.background = 'rgba(0, 0, 0, 0.1)';
  worknetAIOption.style.background = 'transparent';
  dropdownMenu.style.display = 'none';
});

dropdownButton.addEventListener('click', function(event) {
  console.log('Chatbot Dropdown clicked');
  event.stopPropagation(); // Prevent the click event from bubbling up to the document
  dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
});

// Close the dropdown menu when clicking outside of it
document.addEventListener('click', function(event) {
  if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.style.display = 'none';
  }
});

dropdownMenu.appendChild(worknetAIOption);
dropdownMenu.appendChild(worknetAdvancedAIOption);
chatbotHeader.appendChild(dropdownButton);
chatbotHeader.appendChild(dropdownMenu);
  
  // Add the eraser button to the header
  var clearChatButton = document.createElement('button');
  clearChatButton.id = 'clear-chat';
  clearChatButton.title = 'Clear Chat';
  clearChatButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0056b3">
    <path d="M3 6l3 18h12l3-18h-18zm16.5 2l-1.5 14h-10l-1.5-14h13zm-10.5-4v-2h6v2h5v2h-16v-2h5zm2 4h2v10h-2v-10zm4 0h2v10h-2v-10zm-8 0h2v10h-2v-10z"/>
  </svg>
`;
  clearChatButton.style.background = 'transparent';
  clearChatButton.style.border = 'none';
  clearChatButton.style.cursor = 'pointer';
  clearChatButton.style.position = 'absolute';
  clearChatButton.style.top = '14px';
  clearChatButton.style.right = '40px'; // Adjusted position
  clearChatButton.style.transition = 'color 0.3s';
  
  clearChatButton.onmouseover = function() {
    clearChatButton.style.color = '#00458f';
  };
  clearChatButton.onmouseout = function() {
    clearChatButton.style.color = '#0056b3';
  };
  
  chatbotHeader.appendChild(clearChatButton);
  
  // Store the original position and size
let originalPosition = {
  bottom: '80px',
  right: '20px',
  width: '400px',
  height: '500px',
  borderRadius: '15px',
  boxShadow: '0px 8px 16px rgba(0,0,0,0.2)'
};

// Full-screen toggle button
var fullscreenButton = document.createElement('button');
fullscreenButton.innerHTML = '&#x26F6;'; // Fullscreen icon
fullscreenButton.style.position = 'absolute';
fullscreenButton.style.top = '10px';
fullscreenButton.style.left = '10px'; // Moved to the left corner
fullscreenButton.style.background = 'transparent';
fullscreenButton.style.border = 'none';
fullscreenButton.style.fontSize = '18px';
fullscreenButton.style.color = '#0056b3';
fullscreenButton.style.cursor = 'pointer';
fullscreenButton.style.transition = 'color 0.3s';

fullscreenButton.onmouseover = function() {
  fullscreenButton.style.color = '#00458f';
};
fullscreenButton.onmouseout = function() {
  fullscreenButton.style.color = '#0056b3';
};

fullscreenButton.addEventListener('click', function() {
  if (chatbotContainer.classList.contains('fullscreen')) {
    // Restore the original position and size
    chatbotContainer.classList.remove('fullscreen');
    chatbotContainer.style.position = 'fixed';
    chatbotContainer.style.bottom = originalPosition.bottom;
    chatbotContainer.style.right = originalPosition.right;
    chatbotContainer.style.width = originalPosition.width;
    chatbotContainer.style.height = originalPosition.height;
    chatbotContainer.style.borderRadius = originalPosition.borderRadius;
    chatbotContainer.style.boxShadow = originalPosition.boxShadow;
    fullscreenButton.innerHTML = '&#x26F6;'; // Fullscreen icon
    document.body.style.overflow = 'auto'; // Enable scrolling on the body
  } else {
    // Enter fullscreen mode
    chatbotContainer.classList.add('fullscreen');
    chatbotContainer.style.position = 'fixed';
    chatbotContainer.style.top = '0';
    chatbotContainer.style.left = '0';
    chatbotContainer.style.width = '100vw';
    chatbotContainer.style.height = '100vh';
    chatbotContainer.style.borderRadius = '0';
    chatbotContainer.style.boxShadow = 'none';
    chatbotContainer.style.zIndex = '10000'; // Ensure it's on top
    fullscreenButton.innerHTML = '&#x1F5D4;'; // Exit fullscreen icon
    document.body.style.overflow = 'hidden'; // Disable scrolling on the body
  }
});

chatbotHeader.appendChild(fullscreenButton);

// Close button
var closeButton = document.createElement('button');
closeButton.innerHTML = '&#x2715;'; // Cross icon
closeButton.style.position = 'absolute';
closeButton.style.top = '10px';
closeButton.style.right = '10px'; // Positioned at the right corner
closeButton.style.background = 'transparent';
closeButton.style.border = 'none';
closeButton.style.fontSize = '18px';
closeButton.style.color = '#0056b3';
closeButton.style.cursor = 'pointer';
closeButton.style.transition = 'color 0.3s';

closeButton.onmouseover = function() {
  closeButton.style.color = '#00458f';
};
closeButton.onmouseout = function() {
  closeButton.style.color = '#0056b3';
};

closeButton.addEventListener('click', function() {
  chatbotContainer.style.display = 'none';
  chatbotButton.style.display = 'flex';
});

chatbotHeader.appendChild(closeButton);

  // Messages container
  var chatbotMessages = document.createElement('div');
  chatbotMessages.id = 'chatbot-messages';
  chatbotMessages.style.flexGrow = '1';
  chatbotMessages.style.padding = '10px';
  chatbotMessages.style.overflowY = 'auto';
  chatbotMessages.style.backgroundColor = '#d9c4f8';

  // Typing dots animation (hidden by default)
  var typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.style.display = 'none';
  typingIndicator.style.backgroundColor = '#d9c4f8';
  typingIndicator.innerHTML = `
    <div style="display: flex; justify-content: center;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
      <img src="chatbot/load.gif" alt="Bot Icon" style="width: auto; height: 50px; border-radius: 50%; background-color: #d9c4f8;">
    </div>
  `;
  typingIndicator.style.textAlign = 'center';

  // Style for the dots
  var style = document.createElement('style');
  style.innerHTML = `
    /* Add this to your existing CSS */
    .dropdownmenu {
        position: absolute;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(244, 221, 253, 0.8); /* Glass-like finish with specified color */
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px); /* Glass effect */
        display: none; /* Hidden by default */
        z-index: 10000; /* Ensure it's on top */
        width: 99%; /* Same width as the widget */
        border-radius: 10px; /* Rounded corners */
        overflow: hidden; /* Ensure content doesn't overflow */
    }
    
    .dropdown-option {
        padding: 10px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s;
    }
        
    .dropdown-option:hover {
        background: rgba(0, 0, 0, 0.1); /* Highlight on hover */
    }

    #chatbot-messages div {
      padding: 8px;
      margin-bottom: 10px;
      border-radius: 8px;
      background-color: #f4ddfd;
      font-family: Arial, sans-serif;
      transition: background-color 0.3s;
    }

    #chatbot-messages div:hover {
      background-color: #e3c6f2;
    }

    #chatbot-messages div b {
      color: #0056b3;
    }

    .dot {
      height: 8px;
      width: 8px;
      margin: 0 2px;
      background-color: #f7f8fc;
      border-radius: 50%;
      display: inline-block;
      animation: dot-blink 1.2s infinite ease-in-out;
    }

    @keyframes dot-blink {
      0%, 20% {
        background-color: #f7f8fc;
      }
      50% {
        background-color: #004494;
      }
    }

@keyframes smoothRGB {
    0% {
        background-image: linear-gradient(
            to left,
            rgba(255, 0, 0, 1),
            rgba(255, 255, 0, 1),
            rgba(0, 255, 0, 1),
            rgba(0, 0, 255, 1),
            rgba(255, 0, 0, 1)
        );
    }
    33% {
        background-image: linear-gradient(
            to left,
            rgba(255, 255, 0, 1),
            rgba(0, 255, 0, 1),
            rgba(0, 0, 255, 1),
            rgba(255, 0, 0, 1),
            rgba(255, 255, 0, 1)
        );
    }
    66% {
        background-image: linear-gradient(
            to left,
            rgba(0, 255, 0, 1),
            rgba(0, 0, 255, 1),
            rgba(255, 0, 0, 1),
            rgba(255, 255, 0, 1),
            rgba(0, 255, 0, 1)
        );
    }
    100% {
        background-image: linear-gradient(
            to left,
            rgba(0, 0, 255, 1),
            rgba(255, 0, 0, 1),
            rgba(255, 255, 0, 1),
            rgba(0, 255, 0, 1),
            rgba(0, 0, 255, 1)
        );
    }
}

#chatbot-send-button img  {
    border: 2px solid transparent; /* Initial border */
    border-radius: 50%; /* Circular border */
    background-size: 100% 100%;
    animation: smoothRGB 0.25s linear infinite;
}


#chatbot-send-button.typing img {
    background-size: 100% 100%;
    animation: smoothRGB 0.125s linear infinite;
}

    /* Style for the side scroller (scrollbar) */
    #chatbot-messages {
      scrollbar-width: thin; /* Firefox */
      scrollbar-color: rgba(0, 0, 0, 0.2) transparent; /* Firefox */
    }

    #chatbot-messages::-webkit-scrollbar {
      width: 8px; /* Chrome, Safari */
    }

    #chatbot-messages::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1); /* Transparent background */
    }

    #chatbot-messages::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3); /* Darker color for the scrollbar */
      border-radius: 10px; /* Rounded edges */
    }

    #chatbot-messages::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5); /* Darker on hover */
    }
  `;
  document.head.appendChild(style);

  // Input area
  var chatbotInputContainer = document.createElement('div');
  chatbotInputContainer.style.display = 'flex';
  chatbotInputContainer.style.padding = '10px';
  chatbotInputContainer.style.borderTop = '1px solid #ccc';
  chatbotInputContainer.style.backgroundColor = '#d9c4f8';

  var chatbotInput = document.createElement('input');
  chatbotInput.type = 'text';
  chatbotInput.id = 'user-input';
  chatbotInput.placeholder = 'Type your message...';
  chatbotInput.style.flexGrow = '1';
  chatbotInput.style.padding = '10px';
  chatbotInput.style.border = 'none';
  chatbotInput.style.backgroundColor = '#f4ddfd';
  chatbotInput.style.borderRadius = '5px';
  chatbotInput.style.boxShadow = '0px 1px 3px rgba(0,0,0,0.1)';

  // Create the send button
var chatbotSendButton = document.createElement('button');
chatbotSendButton.innerHTML = `
    <img src="chatbot/sendbutton.png" alt="Send Icon" style="width: auto; height: 30px; margin-top: 5px; margin-right: 5px">
`;
chatbotSendButton.id = 'chatbot-send-button';
chatbotSendButton.style.marginLeft = '10px';
chatbotSendButton.style.backgroundColor = 'transparent';
chatbotSendButton.style.border = 'none';
chatbotSendButton.style.cursor = 'pointer';
chatbotSendButton.style.transition = 'background-color 0.3s';
chatbotSendButton.style.padding = '0'; // Remove padding to make it look like an icon

chatbotSendButton.onmouseover = function() {
    chatbotSendButton.querySelector('img').style.transform = 'scale(1.2)';
    chatbotSendButton.querySelector('img').style.transition = 'transform 0.3s ease';
};
chatbotSendButton.onmouseout = function() {
    chatbotSendButton.querySelector('img').style.transform = 'scale(1)';
    chatbotSendButton.querySelector('img').style.transition = 'transform 0.3s ease';
};

  chatbotInputContainer.appendChild(chatbotInput);
  chatbotInputContainer.appendChild(chatbotSendButton);

  // Append header, messages, typing indicator, input container, and fullscreen button to chatbot container
  chatbotContainer.appendChild(chatbotHeader);
  chatbotContainer.appendChild(chatbotMessages);
  chatbotContainer.appendChild(typingIndicator);
  chatbotContainer.appendChild(chatbotInputContainer);
  chatbotContainer.appendChild(fullscreenButton);

  // Append chatbot container to the body
  document.body.appendChild(chatbotContainer);

   // Array of example messages
const exampleMessages = [
  'How do I improve my resume?',
  'What are the best job search strategies?',
  'Can you help me prepare for an interview?',
  'What skills are in demand in my field?',
  'How do I negotiate a salary offer?',
  'What are some tips for networking?',
  'How do I write a cover letter?',
  'What are the best online courses for my career?',
  'Can you help me find a job that matches my skills?',
  'What should I include in my resume to make it stand out?',
  'How can I improve my LinkedIn profile?',
  'What are some common interview questions and how should I answer them?',
  'What are the best ways to network in my industry?',
  'How do I ask for a raise at work?',
  'What are the top companies hiring in my field right now?',
  'How can I balance work and personal life effectively?',
  'What are some good online courses to advance my career?',
  'How do I handle job rejections and stay motivated?',
  'What are the latest trends in my industry?',
  'How do I prepare for a virtual interview?',
  'What are some tips for writing a cover letter?',
  'How can I switch careers without starting from scratch?',
  'What skills should I focus on developing for my career growth?',
  'How do I switch careers?',
  'What should I include in my LinkedIn profile?',
  'How do I handle job rejections?',
  'What are the top companies hiring in my field?',
  'How do I balance work and personal life?',
  'What are the latest trends in my industry?',
  'How do I ask for a promotion?'
];

cycleMessages(chatbotInput, exampleMessages);

// Function to type out the example messages
function typeMessage(element, message, callback) {
  let index = 0;
  const typingSpeed = 100; // Adjust typing speed here

  function type() {
      if (index < message.length) {
          element.placeholder = message.substring(0, index + 1) + '|';
          index++;
          setTimeout(type, typingSpeed);
      } else {
          element.placeholder = message; // Remove the cursor after typing
          setTimeout(callback, 1000); // Wait before showing the next message
      }
  }

  type();
}

// Function to cycle through the example messages
function cycleMessages(element, messages) {
  let messageIndex = 0;

  function showNextMessage() {
      typeMessage(element, messages[messageIndex], () => {
          messageIndex = (messageIndex + 1) % messages.length;
          showNextMessage();
      });
  }

  showNextMessage();
}

// Start cycling through the example messages
cycleMessages(chatbotInput, exampleMessages);

  // Make the chatbot container draggable
  var isDragging = false;
  var offsetX, offsetY;

  chatbotContainer.onmousedown = function(event) {
    isDragging = true;
    offsetX = event.clientX - chatbotContainer.getBoundingClientRect().left;
    offsetY = event.clientY - chatbotContainer.getBoundingClientRect().top;
    document.onmousemove = function(event) {
      if (isDragging) {
        chatbotContainer.style.left = (event.clientX - offsetX) + 'px';
        chatbotContainer.style.top = (event.clientY - offsetY) + 'px';
      }
    };
    document.onmouseup = function() {
      isDragging = false;
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  flag = 1;

// Function to handle the message sending
async function sendMessage() {
  var userInput = chatbotInput.value;

  const userDetails = await fetchUserDetails(userId);

  if (!userDetails) {
    console.error('Failed to fetch user details');
        return;
    }
    
    if (userInput.trim() !== '') {
        // Display user message
        var userMessage = document.createElement('div');
        userMessage.style.display = 'flex';
        userMessage.style.justifyContent = 'flex-end'; // Align to the right
        userMessage.style.marginBottom = '10px'; // Add some space between messages
        
        var userMessageContent = document.createElement('div');
        userMessageContent.style.display = 'flex';
        userMessageContent.style.flexDirection = 'column'; // Stack content vertically
        userMessageContent.style.alignItems = 'flex-end'; // Align content to the right
        userMessageContent.style.borderRadius = '10px';
                userMessageContent.style.padding = '10px';
        userMessageContent.style.maxWidth = '70%'; // Limit the width of the message
        
        userMessageContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
          <img src="${profilePicture}" alt="User Pic" style="width: 40px; height: 40px; border-radius: 50%; margin-bottom: 5px;">
          <div style="border-radius: 10px; padding: 10px; max-width: 100%; text-align: right;">
              <b style="margin-bottom: 5px;">${username}:</b>
              <div>${userInput}</div>
          </div>
            </div>
        `;
        
        userMessage.appendChild(userMessageContent);
        chatbotMessages.appendChild(userMessage);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Scroll to the bottom
        
        // Clear input
        chatbotInput.value = '';
        
        // Show typing indicator
        typingIndicator.style.display = 'block';
        typingIndicator.style.backgroundColor = '#d9c4f8';
        
    const payload = {
      userId,
      message: userInput,
      firstname: userDetails.firstName,
      lastname: userDetails.lastName,
      city: userDetails.city,
      gender: userDetails.gender,
      languages: userDetails.languages,
      type: userDetails.type,
      courses: userDetails.courses,
      college: userDetails.college,
      stream: userDetails.stream,
      startYear: userDetails.startYear,
      endYear: userDetails.endYear,
      skills: userDetails.skills,
      email: userDetails.email,
      contact: userDetails.contact,
      tools: false,
    };

    // Send message to the backend
    fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Include userId in the payload
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Response:', data); // Log the response
        // Create a new div for the bot's response
        var botMessage = document.createElement('div');
        // Use innerHTML and replace newlines with <br> for better formatting
        var formattedResponse = data.response
          .replace(/\*\*(.*?)\*\*/g, '<br><b>$1</b><br>') // Convert **bold** to <b>
          .replace(/\*(.*?)\*/g, '<i>$1</i>') // Convert *italic* to <i>
          .replace(/^\* (.+)$/gm, '<li>$1</li>') // Convert * bullet points to <li>
          .replace(/(<li>.+<\/li>)/g, '<ul>$1</ul>'); // Wrap <li> in <ul>

        // Create a new div for the bot's response with bot icon
        botMessage.style.display = 'flex';  // Align icon and message horizontally
        botMessage.style.alignItems = 'top';
        botMessage.innerHTML = `
          <div>
            <img src="chatbot/worknet.gif" alt="Bot Icon" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
            <div>
              <b style="margin-bottom: 5px; display: flex; justify-content: space-between;">
                WorkNet Career Counsellor: 
              </b>
              <div>${formattedResponse}</div>
            </div>
          </div>`;

        // Append the bot message to the chat container
        chatbotMessages.appendChild(botMessage);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Hide typing indicator after the response
        typingIndicator.style.display = 'none';
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}

  // Function to send a default greeting message
function sendGreeting() {
  console.log("Sending greeting message");

  if (!greetingSent) {
    var greetingMessage = document.createElement('div');
    greetingMessage.style.display = 'flex';
    greetingMessage.style.alignItems = 'top';
    greetingMessage.innerHTML = `
      <div>
        <img src="chatbot/ai.gif" alt="Bot Icon" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
        <div>
          <b style="margin-bottom: 5px;">WorkNet Career Counsellor:</b>
          <div id="typingEffectContainer">
            Hello, ${username}! <br>How can I help you today? <br>I can assist you with <span id="typingEffect"></span>
          </div>
        </div>
      </div>`;
    chatbotMessages.appendChild(greetingMessage);
    const typingElement = document.getElementById('typingEffect');
        const topics = [
          'job search. ',
          'career guidance. ',
          'internships. ',
          'resumes. ',
          'interview tips. ',
          'networking. ',
          'cover letters. ',
          'job applications. ',
          'career development. ',
          'job offers. ',
          'salary negotiation. ',
          'freelancing. ',
          'remote work. ',
          'work-life balance. ',
          'professional skills. ',
          'personal branding. ',
          'LinkedIn optimization. ',
          'portfolio building. ',
          'career transitions. ',
          'mentorship. ',
          'job market trends. ',
          'company research. ',
          'job fairs. ',
          'volunteering opportunities. ',
          'soft skills development. ',
          'technical skills enhancement. ',
          'certifications. ',
          'career planning. ',
          'job satisfaction. ',
          'workplace culture. ',
          'employee benefits. ',
          'job security. ',
          'career growth strategies. ',
          'performance reviews. ',
          'conflict resolution. ',
          'team collaboration. ',
          'leadership skills. ',
          'public speaking. ',
          'presentation skills. ',
          'project management. ',
          'time management. ',
          'stress management. ',
          'workplace diversity. ',
          'inclusion practices. ',
          'employee engagement. ',
          'professional networking events. ',
          'career workshops. ',
          'job shadowing. ',
          'internship programs. ',
          'graduate programs. ',
          'career fairs. ',
          'job boards. ',
          'resume writing services. ',
          'career coaching. ',
          'job search engines. ',
          'job alerts. ',
          'job application tracking. ',
          'job interview preparation. ',
          'job interview follow-up. ',
          'job offer evaluation. ',
          'job relocation. ',
          'career change. '
        ];
        let topicIndex = 0;
        let charIndex = 0;
        let currentTopic = '';
        let isDeleting = false;
    
        function type() {
            if (topicIndex < topics.length) {
                if (!isDeleting && charIndex <= topics[topicIndex].length) {
                    currentTopic = topics[topicIndex].substring(0, charIndex);
                    charIndex++;
                    typingElement.innerHTML = currentTopic;
                } else if (isDeleting && charIndex >= 0) {
                    currentTopic = topics[topicIndex].substring(0, charIndex);
                    charIndex--;
                    typingElement.innerHTML = currentTopic;
                }
    
                if (charIndex === topics[topicIndex].length) {
                    isDeleting = true;
                    setTimeout(type, 2000); // Pause before deleting
                } else if (charIndex === 0 && isDeleting) {
                    isDeleting = false;
                    topicIndex++;
                    setTimeout(type, 500); // Pause before typing next topic
                } else {
                    setTimeout(type, isDeleting ? 50 : 100);
                }
            } else {
                typingElement.innerHTML = ''; // Clear the typing effect
            }
        }
    
        type();
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    greetingSent = true;
  }
}
    
               // Function to fetch chat history
        function fetchChatHistory() {
          console.log(`Fetching chat history for userId: ${userId}`); // Log userId
          fetch(`/get-chat-history/${userId}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              console.log('Chat history data:', data); // Log the data
              // Display the last 10 messages
              const lastMessages = data.history.slice(-10);
              lastMessages.forEach(message => {
                console.log('Processing message:', message); // Log each message
                var messageDiv = document.createElement('div');
                messageDiv.style.display = 'flex';
                messageDiv.style.alignItems = 'top';
        
                // Format the message text
                const formattedMessage = message.message
                  .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Convert **bold** to <b>
                  .replace(/\*(.*?)\*/g, '<i>$1</i>') // Convert *italic* to <i>
                  .replace(/^\* (.+)$/gm, '<li>$1</li>') // Convert * bullet points to <li>
                  .replace(/(<li>.+<\/li>)/g, '<ul>$1</ul>') // Wrap <li> in <ul>
                  .replace(/\n/g, '<br>'); // Convert newlines to <br>
        
                if (message.sender === 'bot') {
                  messageDiv.innerHTML = `
                    <div>
                      <img src="chatbot/worknet.gif" alt="Bot Icon" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
                      <div>
                        <b style="margin-bottom: 5px;">WorkNet Career Counsellor:</b>
                        <div>${formattedMessage}</div> <!-- Use formattedMessage -->
                      </div>
                    </div>`;
                    chatbotMessages.appendChild(messageDiv);
                } else {
                  var userMessageContainer = document.createElement('div');
                  userMessageContainer.style.display = 'flex';
                  userMessageContainer.style.justifyContent = 'flex-end'; // Align to the right
                  userMessageContainer.style.marginBottom = '10px'; // Add some space between messages
                
                  userMessageContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <img src="${profilePicture}" alt="User Pic" style="width: 40px; height: 40px; border-radius: 50%; margin-bottom: 5px;">
                <div style="border-radius: 10px; padding: 10px; max-width: 100%; text-align: right;">
                    <b style="margin-bottom: 5px;">${username}:</b>
                    <div>${formattedMessage}</div> <!-- Use formattedMessage -->
                </div>
            </div>`;
            chatbotMessages.appendChild(userMessageContainer);
                }
                
              });
              chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            })
            .catch(error => {
              console.error('Error fetching chat history:', error);
            });
        }
  
  // Toggle the chatbot or show modal on button click
chatbotButton.addEventListener('click', async function () {
  const userDetails = await fetchUserDetails(userId);
  if (!userDetails.firstName || !userDetails.lastName) {
    showModal('Please complete your profile to use the chatbot.');
  } else {
    console.log("Chatbot button clicked");
  
    let chatHistoryFetched = false; // Flag to check if chat history has been fetched

    chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'flex' : 'none';
    
    if (chatbotContainer.style.display === 'flex') {
     
      if (!greetingSent) {
        sendGreeting();
        fetchChatHistory();
      } else if (flag == 0) {
        var followUpMessage = document.createElement('div');
        followUpMessage.style.display = 'flex';
        followUpMessage.style.alignItems = 'top';
        followUpMessage.innerHTML = `
          <div>
            <img src="chatbot/ai.gif" alt="Bot Icon" style="width: 42px; height: 42px; border-radius: 50%; margin-bottom: 5px;">
            <div>
              <b style="margin-bottom: 5px;">WorkNet Career Counsellor:</b>
            </div>
            <div>${username}, feel free to ask more queries related to career, jobs, education, and related stuff. I'm still here to help.</div>
          </div>`;
        chatbotMessages.appendChild(followUpMessage);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        flag = 1;
      }
    }
  }
    });

    // Function to clear chat history
  function clearChatHistory() {
    fetch(`/clear-chat-history/${userId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Chat history cleared:', data); // Log the response
  
        // Clear the chatbox
        chatbotMessages.innerHTML = '';
  
        // Reset the greetingSent flag
        greetingSent = false;
  
        // Display the greeting message
        sendGreeting();
      })
      .catch(error => {
        console.error('Error clearing chat history:', error);
      });
  }

// Add event listener to the clear chat button
document.getElementById('clear-chat').addEventListener('click', clearChatHistory);

chatbotInput.addEventListener('input', function() {
  if (chatbotInput.value.trim() !== '') {
    chatbotSendButton.classList.add('typing');
  } else {
    chatbotSendButton.classList.remove('typing');
  }
});

  // Send message on button click
  chatbotSendButton.addEventListener('click', function() {
    sendMessage();
    chatbotSendButton.classList.remove('typing');
});

  // Send message on pressing Enter
  chatbotInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
        chatbotSendButton.classList.remove('typing');
    }
  });
})();
