const form = document.getElementById("previewForm");
const urlInput = document.getElementById("urlInput");
const statusEl = document.getElementById("status");
const card = document.getElementById("cardContainer");
const previewImage = document.getElementById("previewImage");
const previewTitle = document.getElementById("previewTitle");
const previewDescription = document.getElementById("previewDescription");
const previewDomain = document.getElementById("previewDomain");
const faviconEl = document.getElementById("favicon");
const debug = document.getElementById("debug");
const thumbWrap = document.getElementById("thumbWrap");
const goBtn = document.getElementById("goBtn");

form.addEventListener("submit", handlePreview);
goBtn.addEventListener("click", handlePreview);

function setStatus(s) {
  statusEl.textContent = s;
}

function showCard(obj) {
  card.classList.remove("hidden");
  previewTitle.textContent = obj.title || "(No title found)";
  previewDescription.textContent = obj.description || "";
  previewDomain.textContent = obj.domain || "";

  // image
  if (obj.image) {
    previewImage.src = obj.image;
    previewImage.style.display = "block";
  } else {
    previewImage.src = "";
    previewImage.style.display = "none";
  }

  // favicon
  if (obj.favicon) {
    faviconEl.src = obj.favicon;
    faviconEl.style.display = "inline-block";
  } else {
    faviconEl.src = "";
    faviconEl.style.display = "none";
  }
}

async function handlePreview(e) {
  e && e.preventDefault();
  const raw = urlInput.value.trim();
  if (!raw) {
    setStatus("Please enter a URL.");
    return;
  }

  setStatus("Fetching preview...");
  card.classList.add("hidden");
  debug.textContent = "";

  try {
    // call backend API
    const resp = await fetch(`/api/preview?url=${encodeURIComponent(raw)}`);
    const data = await resp.json();

    if (!resp.ok) {
      setStatus("Error: " + (data.error || resp.statusText));
      debug.textContent = JSON.stringify(data, null, 2);
      return;
    }

    setStatus("Preview loaded");
    showCard(data);
    debug.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    setStatus("Request failed");
    debug.textContent = String(err);
  }
}
