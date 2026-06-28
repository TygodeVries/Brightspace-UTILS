console.log("Loaded Export Shortcut Injection!");

window.brightspacePortfolioId = null;
let customBtn;

let loading = false;

function checkInject() {
  const allButtons = document.querySelectorAll('button.ant-btn');
  let targetBtn = null;

  for (const btn of allButtons) {
    if (btn.textContent.trim() === "Add evidence") {
      targetBtn = btn;
      break;
    }
  }

  if (!targetBtn) return;
  if (targetBtn.parentElement.querySelector('.export-btn')) return;

  customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.className = 'ant-btn css-zrgkp ant-btn-default export-btn';
  customBtn.innerHTML = 'Export Collection'; 

  Object.assign(customBtn.style, {
    marginLeft: '8px',
    backgroundColor: '#af4c96',
    color: 'white',
    borderColor: '#af4c99',
    fontWeight: '500'
  });

  customBtn.addEventListener('click', async () => {
    customBtn.disabled = true;
    customBtn.textContent = "Loading...";
    loading = true;
    await exportCollection();
    customBtn.textContent = "Export Collection";
    loading = false;
    customBtn.disabled = false;
  });

  targetBtn.parentNode.insertBefore(customBtn, targetBtn.nextSibling);
}

function addDot() {
    if(loading)
    {
        customBtn.textContent = customBtn.textContent + ".";
    }
}

setInterval(addDot, 1000);

setInterval(checkInject, 500);

let portfolioId;
async function exportCollection() {
    const dataStorage = document.getElementById('brightspace-portfolio-data');
    portfolioId = dataStorage ? dataStorage.getAttribute('data-portfolio-id') : null;

    if (!portfolioId) {
        portfolioId = window.brightspacePortfolioId;
    }

    if (!portfolioId) {
        alert("Portfolio ID hasn't loaded yet. Try scrolling down, or click on an evidence piece first!");
        loading = false;
        return;
    }

    const token = dataStorage ? dataStorage.getAttribute('data-auth-token') : null;
    if (!token) {
        alert("Authentication token hasn't been intercepted yet. Try scrolling down, or click on an evidence piece first!");
        loading = false;
        return;
    }

    const links = Array.from(document.querySelectorAll('a'))
    .map(a => a.href)
    .filter(href => href && !href.includes('#'));

    const zip = new JSZip();

    try {
        const styleUrl = chrome.runtime.getURL("assets/portfolio/style.css");
        const response = await fetch(styleUrl);
        const cssText = await response.text();
        zip.file("style.css", cssText);
    } catch (err) {
        console.warn("Could not load style.css extension asset, proceeding with empty fallback file.", err);
        zip.file("style.css", "/* Fallback style sheet */");
    }

    console.log(`Starting export execution loop for ${links.length} potential items...`);
    
    for (const link of links) {
        const linkIds = extractPortfolioIds(link);
        if (linkIds == null) continue;
        
        console.log(`Processing Evidence ID: ${linkIds.evidenceId}`);
        const evidence = await getEvidence(portfolioId, linkIds.evidenceId);
        
        if (!evidence || !evidence.latest_version || !evidence.latest_version.files) continue;

        await addEvidenceToZip(evidence, zip);
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    customBtn.textContent = "Zipping...";

    console.log("Compiling ZIP package contents...");
    zip.generateAsync({ type: "blob" }).then((content) => {
        const zipUrl = URL.createObjectURL(content);
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = zipUrl;
        downloadAnchor.download = "collection.zip";
        
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(zipUrl);
        
        console.log("Export complete! Check your downloads browser prompt.");
    });
}


async function addEvidenceToZip(evidence, zip) {
    for (const file of evidence.latest_version.files) {

        customBtn.textContent = "Downloading " + evidence.name + "...";
        
        const type = file.evidenceable_type;
        if (type === "FreeTextEvidenceVersionContent") {
            await addFreeTextEvidence(evidence, zip, file);
        }

        if (type === "FileEvidenceVersionContent") {
            await addFileEvidence(evidence, zip, file);
        }

        if(type ==="UrlEvidenceVersionContent")
        {
            await addLinkEvidence(evidence, zip, file);
        }
    }
}

async function addLinkEvidence(evidence, zip, file) {
    const folderName = (evidence.name || "Untitled").replace(/[/\\?%*:|"<>\s]/g, '_');
    zip.file(folderName + "/link.txt", file.url.url);
}

async function addFileEvidence(evidence, zip, file) {
    const fileId = file.id;
    console.log("Need to download file: " + fileId);

    const previewUrl = "https://portfolio.drieam.app/api/v1/portfolios/" + portfolioId + "/evidence-version-files/" + fileId + "/preview-url";

    const response = await authFetch(previewUrl);
    const previewData = await response.json();
    const downloadUrl = previewData.download_url;

    const imageBlob = await new Promise((resolve, reject) => {
        const requestId = `fetch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        const handleResponse = async (event) => {
            if (event.source !== window || event.data?.type !== "FETCH_IMAGE_RESPONSE" || event.data?.id !== requestId) return;
            
            window.removeEventListener("message", handleResponse);
            
            if (event.data.success) {
                const res = await fetch(event.data.data);
                resolve(await res.blob());
            } else {
                reject(new Error(event.data.error || "Failed to fetch image via background relay"));
            }
        };
        
        window.addEventListener("message", handleResponse);

        window.postMessage({
            type: "FETCH_IMAGE_REQUEST",
            id: requestId,
            url: downloadUrl
        }, "*");
    });

    const folderName = (evidence.name || "Untitled").replace(/[/\\?%*:|"<>\s]/g, '_');
    zip.file(folderName + "/" + file.file.file_name, imageBlob);
}

async function addFreeTextEvidence(evidence, zip, file) {
    let htmlContent = file?.free_text?.free_text || "";
    const folderName = (evidence.name || "Untitled").replace(/[/\\?%*:|"<>\s]/g, '_');
    
    if (!htmlContent) {
        zip.file(`${folderName}/index.html`, "");
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const images = Array.from(doc.querySelectorAll("img"));

    console.log(`Found ${images.length} embedded images inside "${evidence.name}". Localizing assets sequentially...`);

    for (const img of images) {
        const srcUrl = img.getAttribute("src");
        if (!srcUrl) continue;

        try {
            const fileNameMatch = srcUrl.match(/filename(?:%2A=UTF-8%27%27|=)([^&]+)/i);
            let imageName = fileNameMatch 
                ? decodeURIComponent(fileNameMatch[1]).replace(/["']/g, "") 
                : `image_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.png`;

            imageName = imageName.split(';')[0]; 

            console.log(`Downloading authenticated asset via Extension Background: ${imageName}`);

            const imageBlob = await new Promise((resolve, reject) => {
                const requestId = `fetch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                
                const handleResponse = async (event) => {
                    if (event.source !== window || event.data?.type !== "FETCH_IMAGE_RESPONSE" || event.data?.id !== requestId) return;
                    
                    window.removeEventListener("message", handleResponse);
                    
                    if (event.data.success) {
                        const res = await fetch(event.data.data);
                        resolve(await res.blob());
                    } else {
                        reject(new Error(event.data.error || "Failed to fetch image via background relay"));
                    }
                };
                
                window.addEventListener("message", handleResponse);

                window.postMessage({
                    type: "FETCH_IMAGE_REQUEST",
                    id: requestId,
                    url: srcUrl
                }, "*");
            });

            const mediaPath = `${folderName}/media/${imageName}`;
            zip.file(mediaPath, imageBlob);

            img.setAttribute("src", `media/${imageName}`);
            img.removeAttribute("data-signed-id");

            await new Promise(resolve => setTimeout(resolve, 150));

        } catch (error) {
            console.error(`Failed to localize image asset: ${srcUrl}`, error);
        }
    }

    const styleLinkTag = '<link rel="stylesheet" type="text/css" href="../style.css">';
    const updatedHtml = `<h1>${evidence.name}</h1>\n${styleLinkTag}\n${doc.body.innerHTML}`;
    
    zip.file(`${folderName}/index.html`, updatedHtml);
    console.log(`Successfully completed document packaging for: ${folderName}/index.html`);
}

function extractPortfolioIds(urlString) {
  const regex = /\/collection\/(\d+)\/evidence\/(\d+)/;
  const match = urlString.match(regex);

  if (match) {
    return {
      collectionId: match[1],
      evidenceId: match[2]
    };
  }
  return null;
}

async function getEvidence(portfolioId, evidenceId) {
    const apiUrl = `https://portfolio.drieam.app/api/v1/portfolios/${portfolioId}/evidence/${evidenceId}`;
    try {
        const response = await authFetch(apiUrl);
        return await response.json();
    } catch (error) {
        console.error(`Error in getEvidence for ID ${evidenceId}:`, error);
        return null;
    }
}

async function authFetch(url, options = {}) {
  const dataStorage = document.getElementById('brightspace-portfolio-data');
  const token = dataStorage ? dataStorage.getAttribute('data-auth-token') : null;

  options.headers = options.headers || {};

  if (token) {
    options.headers["Authorization"] = token;
  } else {
    console.warn("authFetch warning: No authentication token found in DOM tree yet.");
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}

window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.type !== "FETCH_IMAGE_REQUEST") return;

    const { id, url } = event.data;

    chrome.runtime.sendMessage(
        { action: "fetchImage", url: url },
        (response) => {
            window.postMessage({
                type: "FETCH_IMAGE_RESPONSE",
                id: id,
                success: response?.success || false,
                data: response?.data || null,
                error: response?.error || null
            }, "*");
        }
    );
});