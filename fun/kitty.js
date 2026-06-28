let attempts = 3;

function findHome() {
  attempts--;
  if (attempts <= 0) {
    clearInterval(interval);
    return;
  }

  chrome.storage.local.get(['showKitty'], (result) => {
    if (result.showKitty === false) {
      console.log("Kitty disabled");
      clearInterval(interval);
      return;
    }

    const home = document.querySelector(
      'd2l-labs-navigation-link-image[text="My Home"]'
    );

    if (!home){
        return;
    }

    const container = home.closest('a, button, span, div');
    if (!container)
    {
        console.error("Could not find container for kitty :(");
        return;
    }

    if (container.querySelector('.kitty')) {
        console.warn("Kitty already injected!");
        return;
    }

    const newImg = document.createElement("img");
    newImg.src = chrome.runtime.getURL("assets/Kitty.gif");
    newImg.className = "kitty";

    newImg.style.width = "70px";
    newImg.style.height = "70px";
    newImg.style.marginLeft = "-5px";
    newImg.style.verticalAlign = "middle";

    container.appendChild(newImg);

    console.log("Injected kitty to My Home");

    clearInterval(interval);
  });
}

const interval = setInterval(findHome, 500);