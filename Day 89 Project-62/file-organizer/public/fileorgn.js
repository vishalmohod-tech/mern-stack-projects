document.getElementById("organizeBtn").addEventListener("click", async () => {
  const input = document.getElementById("fileInput");
  const loader = document.getElementById("loader");
  const message = document.getElementById("message");

  const files = input.files;
  if (files.length === 0) {
    alert("Please select a folder first!");
    return;
  }

  loader.classList.remove("hidden");
  message.textContent = "⏳ Organizing files...";

  const formData = new FormData();
  for (const file of files) formData.append("files", file);

  const res = await fetch("/organize", { method: "POST", body: formData });
  const data = await res.json();

  loader.classList.add("hidden");
  message.textContent = data.message;
});
