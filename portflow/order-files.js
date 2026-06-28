console.log("Loaded Filesort Injection!");

function freeTextShortcut() {
  var allButtons = document.querySelectorAll('button.ant-btn');
  let targetBtn = null;

  for (const btn of allButtons) {
    if (btn.textContent.trim() === "Add new version") {
      targetBtn = btn;
      break;
    }
  }

  if (!targetBtn) {
    return;
  }

  if (targetBtn.parentElement.querySelector('.sort-files-shortcut-btn'))
    return;

  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.className = 'ant-btn css-zrgkp ant-btn-default sort-files-shortcut-btn';
  customBtn.innerHTML = 'Sort Files'; 

  Object.assign(customBtn.style, {
    marginLeft: '8px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderColor: '#4CAF50',
    fontWeight: '500'
  });

  customBtn.addEventListener('click', async () => {
    targetBtn.click();
  
    await reupload();
  });

  targetBtn.parentNode.insertBefore(customBtn, targetBtn.nextSibling);
}

setInterval(freeTextShortcut, 500);

// Create a script element to put our stuff
const script = document.createElement("script");

// Get the code, and put it in
script.src = chrome.runtime.getURL("utils/request-intercepts.js");

// Add it to the page
(document.head || document.documentElement).appendChild(script);

async function reupload() {
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find the continue button
    var allButtons = document.querySelectorAll('button.ant-btn');
    let continueBtn = null;

    for (const btn of allButtons) {
      if (btn.textContent.trim() === "Continue") {
        continueBtn  = btn;
        break;
      }
    }

    if (!continueBtn) {
      return;
    }

    continueBtn.click();
    await new Promise(resolve => setTimeout(resolve, 200));

    // Expand the list 
    const header = [...document.querySelectorAll('.ant-collapse-header')]
    .find(el =>
      el.textContent.includes('Use files from latest version (0 selected)')
    );

    header?.querySelector('[role="button"]')?.click();


    await new Promise(resolve => setTimeout(resolve, 200));
    
    var allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log("Found " + allCheckboxes.length + " checkboxes");

    for (let checkbox of allCheckboxes) {
      checkbox.click();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
  
    var allButtons = document.querySelectorAll('button.ant-btn');
    let finalContinueBtn = null;
    for (const btn of allButtons) {
      if (btn.textContent.trim() === "Add new version" && btn.classList.contains('ant-btn-primary')) {
        finalContinueBtn = btn;
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    if (finalContinueBtn) {
      finalContinueBtn.click();
  }
}