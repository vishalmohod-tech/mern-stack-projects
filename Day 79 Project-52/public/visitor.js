const countEl = document.getElementById('count');
const btn = document.getElementById('btn');
const msg = document.getElementById('msg');

async function loadCount(){
  try {
    const res = await fetch('/api/counter');
    const data = await res.json();
    countEl.textContent = data.count;
  } catch(e){
    countEl.textContent = '0';
  }
}

btn.addEventListener('click', async () => {
  msg.textContent = 'Updating...';
  try {
    const res = await fetch('/api/counter', { method: 'POST' });
    const data = await res.json();
    countEl.textContent = data.count;
    msg.textContent = 'Thanks — recorded!';
  } catch (e) {
    msg.textContent = 'Error, try again';
  }
});

loadCount();
