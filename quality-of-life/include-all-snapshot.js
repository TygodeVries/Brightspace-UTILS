// When making a snapshot, you have to select manually what evidence pieces you want to add.
console.log("Loaded Freetext Shortcut Injection!");

function freeTextShortcut() {
    
  let text;
  document.querySelectorAll('span').forEach((span) => {
        if (span.innerHTML === 'The evidence in the overview below is based on the collections you selected in step 1.') {
            console.log('found it', span);
            text = span;
        }
    });


  if(text == null)
    return;

  if(document.getElementById("all"))
    return;

  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.id = "all"
  customBtn.className = 'ant-btn css-zrgkp ant-btn-default freetext-shortcut-btn';
  customBtn.innerHTML = 'Select All'; 

  Object.assign(customBtn.style, {
    marginLeft: '8px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderColor: '#4CAF50',
    fontWeight: '500'
  });

  customBtn.addEventListener('click', async () => {
    clickAll();
  });

  text.parentNode.insertBefore(customBtn, text.nextSibling);
}

setInterval(freeTextShortcut, 500);

async function clickAll() {
    var allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log("Found " + allCheckboxes.length + " checkboxes");

    for (let checkbox of allCheckboxes) {
      checkbox.click();
        await new Promise(resolve => setTimeout(resolve, 10));
    }
  }