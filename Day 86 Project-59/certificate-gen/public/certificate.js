const form = document.getElementById('certForm');
const status = document.getElementById('status');
const previewSection = document.getElementById('previewSection');
const pdfFrame = document.getElementById('pdfFrame');
const downloadLink = document.getElementById('downloadLink');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = 'Generating...';
  previewSection.hidden = true;

  const formData = new FormData(form);

  try {
    const res = await fetch('/generate', { method: 'POST', body: formData });
    const data = await res.json();
    if (data && data.success && data.url) {
      const url = data.url;
      status.textContent = 'Certificate ready!';
      previewSection.hidden = false;
      pdfFrame.src = url;
      downloadLink.href = url;
      downloadLink.download = data.filename;
      previewSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      status.textContent = 'Failed to generate certificate';
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Error generating certificate';
  }
});
