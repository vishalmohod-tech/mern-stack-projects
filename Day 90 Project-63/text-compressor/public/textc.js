const compressBtn = document.getElementById("compressBtn");
const decompressBtn = document.getElementById("decompressBtn");
const fileInput = document.getElementById("fileInput");
const output = document.getElementById("output");

compressBtn.onclick = async () => {
  const text = document.getElementById("inputText").value;
  if (!text.trim()) return alert("Please enter text!");

  const res = await fetch("/compress", {
    method: "POST",
    body: text,
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "compressed.gz";
  a.click();
  URL.revokeObjectURL(url);
};

decompressBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Please choose a .gz file!");

  const res = await fetch("/decompress", {
    method: "POST",
    body: await file.arrayBuffer(),
  });

  const text = await res.text();
  output.textContent = text;
};
