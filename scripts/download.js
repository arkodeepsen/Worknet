(function() {
    // Create and inject the download button
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-button';
    downloadButton.innerText = 'Save as PDF';
    downloadButton.style.position = 'fixed';
    downloadButton.style.bottom = '20px';
    downloadButton.style.right = '20px';
    downloadButton.style.zIndex = '1000';
    downloadButton.style.padding = '10px 15px';
    downloadButton.style.background = 'rgba(255, 255, 255, 0.3)'; // Glass effect
    downloadButton.style.border = 'none';
    downloadButton.style.borderRadius = '10px';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.fontSize = '14px';
    downloadButton.style.backdropFilter = 'blur(10px)'; // Glass effect
    downloadButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)'; // Shadow for depth
    downloadButton.style.color = '#000'; // Text color
    downloadButton.style.transition = 'background 0.3s, transform 0.2s'; // Transition effects
    downloadButton.addEventListener('mouseover', () => {
        downloadButton.style.background = 'rgba(255, 255, 255, 0.5)'; // Change background on hover
        downloadButton.style.transform = 'scale(1.05)'; // Slightly enlarge on hover
    });
    downloadButton.addEventListener('mouseout', () => {
        downloadButton.style.background = 'rgba(255, 255, 255, 0.3)'; // Revert background
        downloadButton.style.transform = 'scale(1)'; // Revert scale
    });

    document.body.appendChild(downloadButton);

    // Create and inject the template selector
    const templateSelector = document.createElement('select');
    templateSelector.id = 'template-selector';
    templateSelector.style.position = 'fixed';
    templateSelector.style.bottom = '60px'; // Place above the download button
    templateSelector.style.right = '20px';
    templateSelector.style.zIndex = '1000';
    templateSelector.style.padding = '5px';
    templateSelector.style.fontSize = '14px';
    templateSelector.style.background = 'rgba(255, 255, 255, 0.3)'; // Glass effect
    templateSelector.style.border = 'none';
    templateSelector.style.borderRadius = '5px';
    templateSelector.style.backdropFilter = 'blur(10px)'; // Glass effect
    templateSelector.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)'; // Shadow for depth
    templateSelector.style.transition = 'background 0.3s'; // Transition effect
    templateSelector.addEventListener('mouseover', () => {
        templateSelector.style.background = 'rgba(255, 255, 255, 0.5)'; // Change background on hover
    });
    templateSelector.addEventListener('mouseout', () => {
        templateSelector.style.background = 'rgba(255, 255, 255, 0.3)'; // Revert background
    });

    // Define template options
    const templates = [
        { id: 'template1', name: 'Minimalist Professional Resume' },
        { id: 'template2', name: 'Creative Sidebar Resume' },
        { id: 'template3', name: 'Elegant Two-Column Resume' },
        { id: 'template4', name: 'Modern One-Page Resume' },
        { id: 'template5', name: 'Dark Themed Technical Resume' }
    ];

    // Get the current template from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentTemplate = urlParams.get('template') || 'template1'; // Default to template1 if not found

    // Populate the template selector and set the current template as selected
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        if (template.id === currentTemplate) { // Mark the current template as selected
            option.selected = true;
        }
        templateSelector.appendChild(option);
    });

    document.body.appendChild(templateSelector);

    // Function to calculate the dimensions of the HTML content
    function getContentDimensions() {
        const content = document.body; // Assuming the body contains all content
        return {
            width: content.scrollWidth,
            height: content.scrollHeight
        };
    }

    // Store original styles
    const originalStyles = document.head.innerHTML;

    // Adjust print settings based on the current template
    window.onbeforeprint = function() {
        console.log("Preparing to print...");

        // Get the dimensions of the content
        const dimensions = getContentDimensions();
        const contentWidth = dimensions.width;
        const contentHeight = dimensions.height;

        // Apply print styles including dynamic page size
        const styles = `
            @media print { 
                @page { 
                    size: ${contentWidth}px ${contentHeight}px; /* Dynamic size based on content */
                    margin: 0; /* Remove all margins */
                } 
                body { 
                    margin: 0; 
                    padding: 0; 
                    -webkit-print-color-adjust: exact; /* Ensure background colors are printed */
                    -moz-print-color-adjust: exact; /* Ensure background colors are printed */
                    print-color-adjust: exact; /* Ensure background colors are printed */
                } 
                /* Add a wrapper for your content */ 
                .print-wrapper { 
                    width: 100%; 
                    height: auto; /* Allow height to adjust based on content */ 
                    overflow: hidden; 
                    border: none; /* Remove borders during print */ 
                } 
                /* Hide the download button in print */ 
                #download-button { 
                    display: none; 
                } 
                /* Hide the template selector in print */ 
                #template-selector { 
                    display: none; 
                } 
            }
        `;

        // Create and append the print wrapper
        const printWrapper = document.createElement("div");
        printWrapper.className = "print-wrapper";

        // Move all body content into the print wrapper
        while (document.body.firstChild) {
            printWrapper.appendChild(document.body.firstChild);
        }
        document.body.appendChild(printWrapper); // Add the wrapper to the body

        // Append the styles
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    };

    // Clean up after printing
    window.onafterprint = function() {
        const printWrapper = document.querySelector('.print-wrapper');
        if (printWrapper) {
            // Move content back to body
            while (printWrapper.firstChild) {
                document.body.appendChild(printWrapper.firstChild);
            }
            // Remove the print wrapper
            document.body.removeChild(printWrapper);
        }
        // Remove the print styles to clean up
        const styleSheet = document.querySelector('style');
        if (styleSheet) {
            document.head.removeChild(styleSheet);
        }
        // Reapply original styles
        document.head.innerHTML = originalStyles; // Restore original styles
    };

    // Event listener for the template selector
    templateSelector.addEventListener('change', function() {
        const resumeId = sessionStorage.getItem('resumeId'); // Replace this with the actual method to get the resumeId
        const selectedTemplate = this.value; // Get the selected template
        // Change the URL to reflect the selected template without downloading
        window.location.href = `/preview-resume?resumeId=${resumeId}&template=${selectedTemplate}`; // Update the URL based on selected template
    });

    // Event listener for the download button
    downloadButton.addEventListener('click', function() {
        // Initiate the PDF download
        window.print(); // Call print to save as PDF
    });

})();
