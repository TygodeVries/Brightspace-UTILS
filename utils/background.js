
// Helper function to bypass the CORS on portflow to download S3 images.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchImage") {
    fetch(request.url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendResponse({ success: true, data: reader.result });
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true; 
  }
});