// Portflow does not allow you to paste in images into the freetext directly. So we cheat the system and do it anyways.

console.log("Started Paste Image Injection");

async function handleImagePaste(event) {

  // Get the clipboard data from the event
  const clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData || !clipboardData.items) return;

  // For every thing on the clipboard
  for (const item of clipboardData.items) {

    // Check if its an image
    if (item.type.indexOf('image') !== -1) {

      // Don't let others touch it.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();


      // Get the image as a file, and rename it.
      const blob = item.getAsFile();

      const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type });

      
      // Find the input thingy
      let fileInput = document.querySelector('input[type="file"]#images') 
                      || document.querySelector('input[type="file"][multiple]')
                      || document.querySelector('input[type="file"]');

                      
      if (!fileInput) {
        
        // Input field not found! Try finding upload button first.
        const uploadBtn = document.querySelector('button[aria-label="Upload image(s)"]');
        
        if (uploadBtn) {
          uploadBtn.click();
          
          // Wait a bit // god i love javascript
          await new Promise(resolve => setTimeout(resolve, 50));
          
          fileInput = document.querySelector('input[type="file"]#images') 
                      || document.querySelector('input[type="file"][multiple]')
                      || document.querySelector('input[type="file"]');
        } else {
          alert("Could not find the 'Upload image(s)' button.");
          return;
        }
      }

      if (fileInput) {

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
      
        const changeEvent = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(changeEvent);
        
        console.log("Yippe, it worked!");
      } else {
        console.error("Clicked the button, but file input still didn't generate.");
      }
      break; 
    }
  }
}

// Start listening to the paste event
window.addEventListener('paste', handleImagePaste, true);