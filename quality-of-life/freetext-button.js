// Adds a freetext button, so we only have to click onces instead of twice

console.log("Loaded Freetext Shortcut Injection!");

function freeTextShortcut() {
  const allButtons = document.querySelectorAll('button.ant-btn');
  let targetBtn = null;

  // Look for the 'Add Evidence' button
  for (const btn of allButtons) {
    if (btn.textContent.trim() === "Add evidence") {
      targetBtn = btn;
      break;
    }
  }

  if (!targetBtn) {
    return;
  }

  // See if the custom button was already added.
  if (targetBtn.parentElement.querySelector('.freetext-shortcut-btn'))
    return;

  // Create a new button for us
  const customBtn = document.createElement('button');
  customBtn.type = 'button'; // We want to make a button
  customBtn.className = 'ant-btn css-zrgkp ant-btn-default freetext-shortcut-btn'; // Make it pretty!
  customBtn.innerHTML = 'Add FreeText';  // Button Text

  // Set the style of the button
  Object.assign(customBtn.style, {
    marginLeft: '8px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderColor: '#4CAF50',
    fontWeight: '500'
  });

  // When the button is clicked
  customBtn.addEventListener('click', async () => {
    
    // Click on the original Add Evidence button to open the popup
    targetBtn.click();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Look for every button
    const buttons = document.querySelectorAll('button');
    
    for (const btn of buttons) {

      // If its the 'Add Freetext' button
      if (btn.textContent.includes("Free text")) {
        btn.click(); // Click on it
        break; 
      }
    }
  });

  // Add the custom button next to the original button
  targetBtn.parentNode.insertBefore(customBtn, targetBtn.nextSibling);
}

// Check to find the button every half a second
setInterval(freeTextShortcut, 500);