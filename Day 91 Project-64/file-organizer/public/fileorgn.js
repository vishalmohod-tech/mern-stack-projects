const uploadBtn = document.getElementById("uploadBtn");
const organizeBtn = document.getElementById("organizeBtn");
const fileInput = document.getElementById("fileInput");
const summaryBox = document.getElementById("summaryBox");

uploadBtn.onclick = async () => {
  const files = fileInput.files;
  if (!files.length) return alert("Please select some files first!");

  for (let file of files) {
    await fetch("/upload", {
      method: "POST",
      headers: { filename: file.name },
      body: file,
    });
  }

  alert("✅ Files uploaded successfully!");
};

organizeBtn.onclick = async () => {
  const res = await fetch("/organize", { method: "POST" });
  const summary = await res.json();

  summaryBox.innerHTML = `
    <h3>📊 Organization Summary:</h3>
    <p>📝 Documents: ${summary.Documents}</p>
    <p>🖼️ Images: ${summary.Images}</p>
    <p>🎬 Videos: ${summary.Videos}</p>
    <p>📦 Others: ${summary.Others}</p>
  `;
};
