const form = document.getElementById('feedbackForm');
const feedbackList = document.getElementById('feedbackList');

async function loadFeedbacks() {
  const res = await fetch('/api/feedbacks');
  const data = await res.json();
  feedbackList.innerHTML = data
    .map(f => `<li><strong>${f.name}</strong>: ${f.message}<span>${f.time}</span></li>`)
    .join('');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !message) return alert('Please fill all fields');

  await fetch('/api/feedbacks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message }),
  });

  form.reset();
  loadFeedbacks();
});

loadFeedbacks();
