function setupToggleNavigation() {
    const navElement = document.querySelector("d2l-labs-navigation");
    
    if (navElement) {
        clearInterval(navTimer); // Stop the loop immediately
        
        // 1. Inject the CSS for smooth slide & fade transitions
        const style = document.createElement('style');
        style.textContent = `
            d2l-labs-navigation {
                max-height: 500px;
                opacity: 1;
                transform: translateY(0);
                transition: max-height 0.4s ease-in-out, 
                            opacity 0.3s ease-in-out, 
                            transform 0.4s ease-in-out;
                overflow: hidden;
            }
            
            d2l-labs-navigation.nav-hidden {
                max-height: 0px !important;
                opacity: 0 !important;
                transform: translateY(-20px) !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
            }
            
            #custom-nav-toggle {
                position: fixed;
                top: 0;
                left: 10px;
                z-index: 999999;
                background: #333;
                color: #fff;
                padding: 4px 8px;
                font-size: 11px;
                font-family: sans-serif;
                cursor: pointer;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
                opacity: 0.2;
                user-select: none;
                transition: opacity 0.2s ease, background 0.2s ease;
            }

            #custom-nav-toggle:hover {
                opacity: 0.8;
                background: #444;
            }
        `;
        document.head.appendChild(style);
        
        navElement.classList.add('nav-hidden');
        
        const toggleLabel = document.createElement('div');
        toggleLabel.id = 'custom-nav-toggle';
        toggleLabel.innerText = '▼ Show Nav';
        document.body.appendChild(toggleLabel);
        
        toggleLabel.addEventListener('click', () => {
            const isHidden = navElement.classList.toggle('nav-hidden');
            toggleLabel.innerText = isHidden ? '▼ Show Nav' : '▲ Hide Nav';
            
            let frames = 0;
            const resizeInterval = setInterval(() => {
                window.dispatchEvent(new Event('resize'));
                frames++;
                if (frames > 20) clearInterval(resizeInterval); // Stop after 400ms animation ends
            }, 20);
        });
        
        console.log("Animated navigation toggle successfully installed!");
    }
}

// Check every 500ms until the element loads
const navTimer = setInterval(setupToggleNavigation, 500);