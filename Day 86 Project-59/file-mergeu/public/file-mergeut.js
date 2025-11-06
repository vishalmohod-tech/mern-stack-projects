document.getElementById("mergeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const res = await fetch("/merge", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.downloadUrl) {
    const link = document.getElementById("downloadLink");
    link.href = data.downloadUrl;
    link.style.display = "block";
    link.textContent = "Download Merged File 📄";
  }
});
