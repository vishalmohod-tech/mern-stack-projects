 async function vote(lang) {
      await fetch(`/vote?lang=${lang}`);
      updateResults();
    }

    async function updateResults() {
      const res = await fetch("/results");
      const data = await res.json();
      document.getElementById("html").textContent = data.html;
      document.getElementById("css").textContent = data.css;
      document.getElementById("js").textContent = data.js;
    }

    // Show current results when page loads
    updateResults();