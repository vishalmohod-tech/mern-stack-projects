const form = document.getElementById("urlForm");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const longUrl = document.getElementById("longUrl").value;
  result.innerHTML = "⏳ Generating short URL...";

  try {
    const res = await fetch("/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl }),
    });

    const data = await res.json();
    const shortLink = `${window.location.origin}/${data.shortCode}`;
    result.innerHTML = `
      ✅ Short URL created:<br>
      <a href="${shortLink}" target="_blank">${shortLink}</a>
    `;
  } catch (err) {
    result.innerHTML = "❌ Error creating short URL.";
  }
});
