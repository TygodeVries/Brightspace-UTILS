console.log("Auto Focus Injection Loaded!");

function autoFocusNameField() {
  const nameField = document.querySelector('input[type="text"]#name');

  if (nameField && !nameField.dataset.hasBeenAutoFocused) {
    nameField.focus(); 
    
    nameField.dataset.hasBeenAutoFocused = "true";
  }
  
  if (!nameField) {
    const freshCheck = document.querySelectorAll('[data-has-been-auto-focused="true"]');
    freshCheck.forEach(el => el.removeAttribute('data-has-been-auto-focused'));
  }
}
setInterval(autoFocusNameField, 300);