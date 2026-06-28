// Attempt to create backups of any freetext.
// #TODO improve this as its very bare-bones at the moment.

let editorObserver = null;
let active = false;
let content = null;
let last = null;
let lastContentE = null;

const observer = new MutationObserver(() => {
    const header = [...document.querySelectorAll('h2')]
        .find(el => el.textContent.includes('Add Free text evidence'));

    const editor = document.querySelector('[aria-label="Evidence content"]');

    
    if (header && editor && !editorObserver) {
        console.log("Found editor, starting backups!");
        active = true;

        if(localStorage.getItem("backup") && localStorage.getItem("backup") !== "" && localStorage.getItem("backup").length > 10 && localStorage.getItem("backup") !== "<p data-placeholder=\"Start typing...\" class=\"is-empty is-editor-empty\"><br class=\"ProseMirror-trailingBreak\"></p>") {

            if (confirm("Brightspace Utils was able to recover a previous version of your evidence. If you want to restore it, click OK. If not, click Cancel and the backup will be cleared.")) {
                console.log("Restoring backup! ");
                console.log(localStorage.getItem("backup"));
            }
            else {
                console.log("Clearing backup!");
                localStorage.removeItem("backup");
            }
        }

        editor.innerHTML = localStorage.getItem("backup") || "";

        editorObserver = new MutationObserver(() => {
            content = editor.innerHTML;

            console.log(content);
            localStorage.setItem("backup", content);
        });

        editorObserver.observe(editor, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    if (!header && editorObserver) {
        console.log("Header gone!");
        active = false;

        editorObserver.disconnect();
        editorObserver = null;
    }
});


observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log("Activated backup script!");

document.addEventListener('click', (e) => {
  let btn = e.target.closest('button');
  if (!btn) return;

  if (btn.textContent.includes("Add evidence") && active) {
    console.log("Clearing backup since user added evidence!");
    localStorage.removeItem("backup");
  }
}, true);