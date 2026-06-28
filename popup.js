document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById('kitty');

  chrome.storage.local.get('showKitty', (result) => {
    checkbox.checked = result.showKitty ?? true;
  });

  checkbox.addEventListener('change', () => {
    chrome.storage.local.set({
      showKitty: checkbox.checked
    });
  });
});