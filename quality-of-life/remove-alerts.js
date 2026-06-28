console.log("Loaded Remove Popup Injection!");

function autoDismissPopups() {
  const closeButton = document.querySelector('button.ant-alert-close-icon');

  if (closeButton) {
    console.log("Auto-dismissing banner...");
    closeButton.click();
  }
}

// Check every 500ms to keep the screen clear of alerts
setInterval(autoDismissPopups, 500);