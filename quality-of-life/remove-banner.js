console.log("Banner cleaner loaded!");

function cleanWorkspaceLayout() {

  const profileBanner = document.querySelector('div.ant-card._card_my3z9_1');
  if (profileBanner && profileBanner.style.display !== 'none') {
    console.log("Removing profile banner layout...");
    profileBanner.style.setProperty('display', 'none', 'important');
  }

  const descriptionRow = document.querySelector('div.ant-row._editableRow_e5ksf_1');
  if (descriptionRow && descriptionRow.style.display !== 'none') {
    console.log("Removing empty editable description row...");
    descriptionRow.style.setProperty('display', 'none', 'important');
  }
}

setInterval(cleanWorkspaceLayout, 300);