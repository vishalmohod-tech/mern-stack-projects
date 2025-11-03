const inputEl = document.getElementById('inputText');
const resultEl = document.getElementById('result');
const shiftEl = document.getElementById('shift');
const encodeBtn = document.getElementById('encodeBtn');
const decodeBtn = document.getElementById('decodeBtn');
const copyBtn = document.getElementById('copyBtn');

async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

encodeBtn.addEventListener('click', async () => {
  const text = inputEl.value || '';
  const shift = Number(shiftEl.value) || 0;
  const r = await postJson('/api/encode', { text, shift });
  if (r.ok) resultEl.value = r.result;
  else resultEl.value = 'Error';
});

decodeBtn.addEventListener('click', async () => {
  const text = inputEl.value || '';
  const shift = Number(shiftEl.value) || 0;
  const r = await postJson('/api/decode', { text, shift });
  if (r.ok) resultEl.value = r.result;
  else resultEl.value = 'Error';
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultEl.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy Result'), 1200);
  } catch (e) {
    copyBtn.textContent = 'Copy Failed';
    setTimeout(() => (copyBtn.textContent = 'Copy Result'), 1200);
  }
});
