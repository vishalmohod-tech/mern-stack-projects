// app.js
const form = document.getElementById('certForm');
const btn = document.getElementById('generateBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  btn.disabled = true;
  btn.textContent = 'Generating...';

  const name = document.getElementById('name').value.trim();
  const course = document.getElementById('course').value.trim();
  const date = document.getElementById('date').value || '';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, course, date })
    });

    if (!res.ok) throw new Error('Server error while generating PDF');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    // create a temporary link and click to download
    const a = document.createElement('a');
    const fileName = (name || 'certificate').replace(/\s+/g, '_') + '_certificate.pdf';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Could not generate PDF: ' + err.message);
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate & Download PDF';
  }
});
