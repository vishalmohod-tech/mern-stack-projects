async function uploadAndCompress() {
  const file = document.getElementById("compressFile").files[0];
  if (!file) return alert("Please select a .txt file");

  const res = await fetch("/compress", {
    method: "POST",
    body: file,
  });

  const data = await res.json();
  document.getElementById(
    "compressResult"
  ).innerHTML = `✅ File compressed! <a href="/download/${data.file}" download>Download compressed.gz</a>`;
}

async function uploadAndExtract() {
  const file = document.getElementById("extractFile").files[0];
  if (!file) return alert("Please select a .gz file");

  const res = await fetch("/extract", {
    method: "POST",
    body: file,
  });

  const data = await res.json();
  document.getElementById(
    "extractResult"
  ).innerHTML = `✅ File extracted! <a href="/download/${data.file}" download>Download extracted.txt</a>`;
}
