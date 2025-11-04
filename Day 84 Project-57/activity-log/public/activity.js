// app.js
const logBtn = document.getElementById('logBtn');
const statusEl = document.getElementById('status');
const refreshBtn = document.getElementById('refreshBtn');
const logsPreview = document.getElementById('logsPreview');

logBtn.addEventListener('click', async () => {
  statusEl.textContent = 'Logging...';
  try {
    const res = await fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'Button clicked' }) });
    const j = await res.json();
    if (j.ok) {
      statusEl.textContent = 'Activity logged!';
      // optional: refresh preview automatically
      loadLogs();
    } else {
      statusEl.textContent = 'Error logging';
    }
  } catch (e) {
    statusEl.textContent = 'Network error';
    console.error(e);
  }
});

// Refresh logs preview
refreshBtn.addEventListener('click', loadLogs);

async function loadLogs() {
  logsPreview.textContent = 'Loading...';
  try {
    const res = await fetch('/activity'); // this path will be added by server route below (server serves file if exists)
    if (!res.ok) throw new Error('Failed to fetch logs: ' + res.status);
    const text = await res.text();
    logsPreview.textContent = text || '(no logs yet)';
  } catch (e) {
    logsPreview.textContent = 'Could not load logs';
    console.error(e);
  }
}
