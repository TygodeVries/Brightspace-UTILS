console.log("Injected Filesort running");

const oldFetch = window.fetch;

// Initialize a global variable so other scripts can access it
window.brightspacePortfolioId = null;

window.fetch = new Proxy(oldFetch, {
  apply: async (target, thing, args) => {
    // Url is the first argument, config is the second. The request contains the method and body.
    var [url, request] = args;
    var method = (request?.method || "GET").toUpperCase();

    if (typeof url === "string") {

      
      // Not sure this is fully save. but uh it works so yay
      if (request?.headers) {
        let token = null;

        if (request.headers instanceof Headers) {
          token = request.headers.get("Authorization");
        } else if (request.headers["Authorization"]) {
          token = request.headers["Authorization"];
        } else if (request.headers["authorization"]) {
          token = request.headers["authorization"];
        }

        if (token) {
          let metaStorage = document.getElementById('brightspace-portfolio-data');
          if (!metaStorage) {
            metaStorage = document.createElement('div');
            metaStorage.id = 'brightspace-portfolio-data';
            metaStorage.style.display = 'none';
            document.body.appendChild(metaStorage);
          }
          // Save it to the DOM element
          metaStorage.setAttribute('data-auth-token', token);
        }
  }

      // We need to find our portfolio code for other things, so keep an eye out for that.
      if (url.includes("/portfolios/") && url.includes("/collections")) {
        const portfolioRegex = /\/portfolios\/(\d+)\/collections/;
        const match = url.match(portfolioRegex);
        if (match && match[1]) {
          const capturedId = match[1];
          console.log("Captured Portfolio ID inside iframe:", capturedId);

          // Check if our hidden meta element already exists
          let metaStorage = document.getElementById('brightspace-portfolio-data');
          
          if (!metaStorage) {
            metaStorage = document.createElement('div');
            metaStorage.id = 'brightspace-portfolio-data';
            metaStorage.style.display = 'none';
            document.body.appendChild(metaStorage);
          }
          
          metaStorage.setAttribute('data-portfolio-id', capturedId);
        }
      }

      if (url.includes("/versions") && method === "POST") {
        try {
          if (request?.body) {
            var body = JSON.parse(request.body);

            if (Array.isArray(body.files)) {
              // Actually sort the files!!!!
              body.files.sort((a, b) =>
                a.file_name.localeCompare(b.file_name)
              );

              // Put back like nothing happened
              request.body = JSON.stringify(body);

              // Give a little heads-up we messed with the page! Just in case something breaks. The user knows why.
              console.log("We automatically sorted the files for you!");
            }
          }
        } catch (e) {
          console.error("Failed to sort files: " + e.message);
        }
      }
    }

    return target.apply(thing, args);
  },
});