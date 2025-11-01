const form = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const contactsList = document.getElementById('contactsList');
const saveBtn = document.getElementById('saveBtn');
const cancelEdit = document.getElementById('cancelEdit');
const contactIdInput = document.getElementById('contactId');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

async function fetchContacts() {
  const res = await fetch('/api/contacts');
  return res.json();
}

function validate(name, phone) {
  if (!name.trim()) return 'Name required';
  if (!phone.trim()) return 'Phone required';
  const phoneDigits = phone.replace(/\D/g,'');
  if (phoneDigits.length < 6) return 'Phone too short';
  return '';
}

function renderList(items) {
  contactsList.innerHTML = '';
  if (!items.length) {
    contactsList.innerHTML = '<li>No contacts yet</li>';
    return;
  }
  items.forEach(c => {
    const li = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'contact-info';
    const top = document.createElement('div');
    top.textContent = `${c.name} — ${c.phone}`;
    const sub = document.createElement('div');
    sub.textContent = c.email || '';
    sub.style.fontSize = '13px';
    sub.style.color = '#555';
    info.appendChild(top);
    info.appendChild(sub);

    const actions = document.createElement('div');
    actions.className = 'contact-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'small-btn';
    editBtn.onclick = () => loadEdit(c);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'small-btn';
    delBtn.onclick = () => deleteContact(c.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(actions);
    contactsList.appendChild(li);
  });
}

function loadEdit(contact) {
  contactIdInput.value = contact.id;
  nameInput.value = contact.name;
  phoneInput.value = contact.phone;
  emailInput.value = contact.email || '';
  saveBtn.textContent = 'Update Contact';
  cancelEdit.classList.remove('hidden');
}

cancelEdit.onclick = () => {
  contactIdInput.value = '';
  form.reset();
  saveBtn.textContent = 'Add Contact';
  cancelEdit.classList.add('hidden');
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const phone = phoneInput.value;
  const email = emailInput.value;
  const validationError = validate(name, phone);
  if (validationError) return alert(validationError);

  const id = contactIdInput.value;
  if (id) {
    // update
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email })
    });
    if (!res.ok) {
      const err = await res.json();
      return alert(err.error || 'Update failed');
    }
    contactIdInput.value = '';
    saveBtn.textContent = 'Add Contact';
    cancelEdit.classList.add('hidden');
  } else {
    // create
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email })
    });
    if (!res.ok) {
      const err = await res.json();
      return alert(err.error || 'Create failed');
    }
  }
  form.reset();
  loadAndRender();
});

async function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    return alert(err.error || 'Delete failed');
  }
  loadAndRender();
}

exportBtn.addEventListener('click', async () => {
  const contacts = await fetchContacts();
  const blob = new Blob([JSON.stringify(contacts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contacts-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', async () => {
  const files = importFile.files;
  if (!files || files.length === 0) return alert('Choose a JSON file first');
  const f = files[0];
  try {
    const txt = await f.text();
    const arr = JSON.parse(txt);
    if (!Array.isArray(arr)) return alert('JSON must be an array of contacts');
    // confirm replace
    if (!confirm('This will replace all current contacts. Continue?')) return;
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(arr)
    });
    const json = await res.json();
    if (!res.ok) return alert(json.error || 'Import failed');
    alert(`Imported ${json.imported} contacts`);
    loadAndRender();
  } catch (e) {
    alert('Invalid JSON file');
  }
});

async function loadAndRender() {
  const contacts = await fetchContacts();
  renderList(contacts);
}

loadAndRender();
