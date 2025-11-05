const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const message = document.getElementById('message');
const preview = document.getElementById('preview');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return alert('Please select a file!');

  const formData = new FormData();
  formData.append('file', file);

  message.textContent = 'Uploading...';
  preview.innerHTML = '';

  const res = await fetch('/upload', { method: 'POST', body: formData });
  const data = await res.json();

  if (data.success) {
    message.textContent = `✅ Uploaded: ${data.filename}`;
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = data.url;
      preview.appendChild(img);
    } else if (file.type.startsWith('text/')) {
      const text = await fetch(data.url).then(r => r.text());
      const pre = document.createElement('pre');
      pre.textContent = text;
      preview.appendChild(pre);
    } else {
      message.textContent += ' (no preview available)';
    }
  } else {
    message.textContent = '❌ Upload failed';
  }
});
