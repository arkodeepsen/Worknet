// Ensure this script only runs once by using an IIFE (Immediately Invoked Function Expression)
(function () {
  // Variables to store user details
let firstName = '';
let lastName = '';
let fullName = '';
let profilePicture = '';
let username = '';
let skills = '';

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry);
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.hidden, .hidden-1, .hidden-2, .hidden-3');

hiddenElements.forEach((el) => observer.observe(el));

// Retrieve the currently logged-in user's ID from localStorage
const userId = localStorage.getItem('userId');

// Example after successful login
sessionStorage.setItem('userId', userId);

if (!userId) {
    console.error('User is not logged in. userId is missing.');
} else {
    // Fetch the username for the logged-in user by userId
    fetch(`/get-username/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                const username = data.username || '';

                // Save the username in localStorage
                localStorage.setItem('username', username);

                // Display the username if element exists
                const usernameElement = document.getElementById('username');
                if (usernameElement) {
                    usernameElement.textContent = username;
                }
                // Display the username in the small span if element exists
                const usernameSmallElement = document.getElementById('username-small');
                if (usernameSmallElement) {
                    usernameSmallElement.textContent = username;
                }
                console.log('users fetch success');
            } else {
                console.error('No user found with this ID.');
            }
        })
        .catch(error => {
            console.error('Error fetching username:', error);
        });

    // Fetch the most recent user details for the logged-in user by userId
    fetch(`/get-user-details/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Store firstName and lastName separately
                firstName = data.firstName || '';
                lastName = data.lastName || '';
                skills = data.skills || '';
                // Store fullName and profilePicture
                fullName = `${firstName} ${lastName}`;
                // Ensure correct path for profilePicture and fallback to default if missing
                profilePicture = data.profilePicture && data.profilePicture !== 'null' 
                    ? `${data.profilePicture}` 
                    : 'assets/default.jpg';

                // Set the profile picture if element exists
                const profilePicElement = document.getElementById('profile-pic');
                if (profilePicElement) {
                    profilePicElement.src = profilePicture;
                }

                // Update other HTML elements if they exist
                const fullNameElement = document.getElementById('full-name');
                if (fullNameElement) {
                    fullNameElement.innerText = fullName;
                }

                const usernameElement = document.getElementById('username');
                if (usernameElement) {
                    usernameElement.innerText = data.username || '';
                }

                // Update profile picture for the small version
                const profilePicSmallElement = document.getElementById('profile-pic-small');
                if (profilePicSmallElement) {
                    profilePicSmallElement.src = profilePicture;
                }

                // Insert firstName into the hero section's welcome message
                const heroH1 = document.querySelector('.hero h1');
                if (heroH1) {
                    heroH1.innerText = `Welcome Back, ${firstName}!`;
                }
                console.log('user_details fetch success');
            } else {
                console.error('No user details found.');
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
        });
}

  // Dark mode toggle logic
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
  
    // Initialize icon colors based on the current mode
    const initializeIcons = () => {
      if (body.classList.contains('dark-mode')) {
        if (sunIcon) {
          sunIcon.style.opacity = '0';
          sunIcon.style.color = '#fff';  // White sun on hover in dark mode
        }
        if (moonIcon) {
          moonIcon.style.opacity = '1';
          moonIcon.style.color = '#fff'; // White moon in dark mode
        }
      } else {
        if (sunIcon) {
          sunIcon.style.opacity = '1';
          sunIcon.style.color = '#f39c12'; // Yellow sun in light mode
        }
        if (moonIcon) {
          moonIcon.style.opacity = '0';
          moonIcon.style.color = '#f1c40f'; // Yellow moon in light mode
        }
      }
    };
  
    // Apply the saved dark mode setting from localStorage
    const applySavedMode = () => {
      const darkMode = localStorage.getItem('darkMode');
      if (darkMode === 'enabled') {
        body.classList.add('dark-mode');
      } else {
        body.classList.remove('dark-mode');
      }
      initializeIcons(); // Initialize icons based on the mode
    };
  
    // Check if darkModeToggle element exists before adding event listener
    if (darkModeToggle) {
        // Toggle dark mode and save the preference in localStorage
        darkModeToggle.addEventListener('click', function() {
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled'); // Save the disabled state
            } else {
                body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled'); // Save the enabled state
            }
            initializeIcons(); // Update icons
        });
    }
  
    // Initialize icons and mode on page load
    applySavedMode();
  });  
    
  // Apply CSS styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    #profile-pic {
      border-radius: 50%;
      width: 100px;
      height: 100px;
    }
    #full-name {
      font-size: 20px;
      color: #333;
    }
    #username {
      font-size: 16px;
      color: #555;
    }
    
    /* Container for profile pic and username */
    .profile-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: #333;
        padding: 5px 10px;
        position: relative; /* Needed for positioning the sliding text */
        overflow: hidden;
    }

    /* Profile Picture */
    .profile-pic-small {
        border-radius: 50%;
        width: 40px;
        height: 40px;
        transition: transform 0.3s ease; /* Optional zoom effect */
    }

    /* Username (initially hidden) */
    #username-small {
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
        opacity: 0; /* Start invisible */
        transform: translateX(50px); /* Start outside the view */
        transition: transform 0.5s ease, opacity 0.5s ease; /* Smooth transition */
        margin-right: 10px; /* Space between the picture and username */
    }

    /* Show username with slide-in effect on hover */
    .profile-link:hover #username-small {
        opacity: 1; /* Fully visible */
        transform: translateX(0); /* Back to original position */
    }

    .profile-link:hover .profile-pic-small {
        transform: scale(1.1); /* Optional zoom effect on profile pic when hovered */
    }

    /* Container for the toggle */
.dark-mode-toggle {
    position: relative;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

/* Style for the Sun Icon */
#sun-icon {
    font-size: 24px;
    color: #f39c12; /* Yellow sun in light mode */
    transition: transform 0.5s ease, opacity 0.3s ease, color 0.3s ease;
    position: absolute;
    opacity: 1; /* Visible */
}

/* Style for the Moon Icon */
#moon-icon {
    font-size: 24px;
    color: #f1c40f; /* Yellow moon initially */
    transition: transform 0.5s ease, opacity 0.3s ease, color 0.3s ease;
    position: absolute;
    opacity: 0; /* Hidden initially */
    transform: rotate(180deg); /* Hidden state */
}

/* Dark mode active: moon icon visible, sun hidden */
.dark-mode-active #sun-icon {
    opacity: 0;
    transform: translateX(30px) rotate(180deg); /* Move out sun */
    color: #fff; /* White sun in dark mode */
}

.dark-mode-active #moon-icon {
    opacity: 1;
    transform: translateX(0) rotate(0); /* Move in moon */
    color: #fff; /* White moon in dark mode */
}

/* On hover, swap icons in light mode */
.dark-mode-toggle:hover #sun-icon {
    transform: translateX(30px) rotate(180deg); /* Move out sun */
    opacity: 0; /* Hide sun */
}

.dark-mode-toggle:hover #moon-icon {
    transform: translateX(0) rotate(0); /* Move in moon */
    opacity: 1; /* Show moon */
}

/* On hover in dark mode, swap back to sun */
.dark-mode-active:hover #moon-icon {
    transform: translateX(-30px) rotate(180deg); /* Move moon left */
    opacity: 0; /* Hide moon */
}

.dark-mode-active:hover #sun-icon {
    transform: translateX(0) rotate(0); /* Move sun into view */
    opacity: 1; /* Show sun */
}
    `;
  document.head.append(style);

})();
// Inject CSS for dropdown menu
function injectDropdownCSS() {
    let css = ``;
    if(window.location.pathname !== '/main') {
    css = `
        .dropdown-menu {
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
            display: none; /* Default to hidden */
            position: flex-end;
            right: 0;
            background-color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            border-radius: 3px;
            z-index: 1000;
            transition: opacity 0.3s ease, transform 0.3s ease; /* Smooth transition */
            opacity: 0; /* Start hidden */
        }
        
        .dropdown-menu.show {
            display: block; /* Show when class is added */
            opacity: 1; /* Fully visible */
        }
        
        .dropdown-menu ul {
            list-style: none;
            margin: 0;
            padding: 0;
            border: 2px solid rgba(0, 0, 0, 0.1);
        }
        
        .dropdown-menu ul li {
            padding: 10px;
            border: 2px solid rgba(0, 0, 0, 0.1);
            align-items: right;
        }
        
        .dropdown-menu ul li a {
            text-decoration: none;
            color: #333;
            font-size: 1.2rem;
        }
        
        .dropdown-menu ul li:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .dark-mode .dropdown-menu {
            background-color: rgba(25, 25, 25, 0.9);
            color: #f1f1f1;
        }
        
        .dark-mode .dropdown-menu ul li a {
            color: #f1f1f1;
        }
    `;
    }
    else {  // For the main page
        css = `
        .dropdown-menu {
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
            display: none; /* Default to hidden */
            position: relative;
            top: 100%;
            right: 0;
            background-color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            border-radius: 3px;
            z-index: 1000;
            transition: opacity 0.3s ease, transform 0.3s ease; /* Smooth transition */
            opacity: 0; /* Start hidden */
        }
        
        .dropdown-menu.show {
            display: block; /* Show when class is added */
            opacity: 1; /* Fully visible */
        }
        
        .dropdown-menu ul {
            list-style: none;
            margin: 0;
            padding: 0;
            border: 2px solid rgba(0, 0, 0, 0.1);
        }
        
        .dropdown-menu ul li {
            padding: 10px;
            border: 2px solid rgba(0, 0, 0, 0.1);
            align-items: right;
        }
        
        .dropdown-menu ul li a {
            text-decoration: none;
            color: #333;
            font-size: 1.2rem;
        }
        
        .dropdown-menu ul li:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .dark-mode .dropdown-menu {
            background-color: rgba(25, 25, 25, 0.9);
            color: #f1f1f1;
        }
        
        .dark-mode .dropdown-menu ul li a {
            color: #f1f1f1;
        }
    `;
    }
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  injectDropdownCSS();
  
  // Function to toggle dropdown visibility
  function toggleDropdown() {
    const maindropdownMenu = document.getElementById('maindropdownMenu');
    maindropdownMenu.classList.toggle('show');
  }

  function logout() {
    // Clear userId from both sessionStorage and localStorage to simulate logout
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
    window.location.reload();  // Refresh the page to reflect logged-out state
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const maindropdownMenu = document.getElementById('maindropdownMenu');
    const profileToggle = document.getElementById('profileToggle');
    if (profileToggle && !profileToggle.contains(event.target)) {
        maindropdownMenu.classList.remove('show');
    }
  });