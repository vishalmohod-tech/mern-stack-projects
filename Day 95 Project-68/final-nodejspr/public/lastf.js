async function publish() {
    const category = document.getElementById("category").value;
    const content = document.getElementById("content").value;

    await fetch("/api/create", {
        method: "POST",
        body: JSON.stringify({ category, content })
    });

    document.getElementById("content").value = "";
    loadAll();
}

async function loadAll() {
    let q = document.getElementById("search").value.toLowerCase();

    let res = await fetch("/api/all");
    let data = await res.json();

    data = data.filter(p =>
        p.content.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );

    let html = "";
    data.forEach(p => {
        html += `
        <div class="item">
            <h3 onclick="openPost('${p.id}')">${p.category}</h3>
            <p>${p.content.substring(0, 100)}...</p>
            <button onclick="deletePost('${p.id}')">Delete</button>
        </div>`;
    });

    document.getElementById("post-list").innerHTML = html;
}

function openPost(id) {
    window.location.href = "/post?id=" + id;
}

async function deletePost(id) {
    await fetch("/api/delete?id=" + id);
    loadAll();
}

function toggleDark() {
    document.body.classList.toggle("dark");
}

loadAll();
