let currentId = "";

async function loadPost() {
    const params = new URLSearchParams(window.location.search);
    currentId = params.get("id");

    let res = await fetch("/api/get?id=" + currentId);
    let p = await res.json();

    document.getElementById("post-box").innerHTML = `
        <h2>${p.category}</h2>
        <p>${p.content}</p>
    `;
}

function goHome() {
    window.location.href = "/";
}

function editPost() {
    window.location.href = `/post.html?id=${currentId}&edit=1`;
}

// Editing Mode
if (window.location.search.includes("edit=1")) {
    (async () => {
        const params = new URLSearchParams(window.location.search);
        currentId = params.get("id");

        let res = await fetch("/api/get?id=" + currentId);
        let p = await res.json();

        document.getElementById("post-box").innerHTML = `
        <select id="edit-category">
            <option ${p.category === "General" ? "selected" : ""}>General</option>
            <option ${p.category === "Tech" ? "selected" : ""}>Tech</option>
            <option ${p.category === "Life" ? "selected" : ""}>Life</option>
        </select>

        <textarea id="edit-content">${p.content}</textarea>
        <br>
        <button onclick="save()">Save</button>
        `;
    })();
}

async function save() {
    const category = document.getElementById("edit-category").value;
    const content = document.getElementById("edit-content").value;

    await fetch("/api/update", {
        method: "POST",
        body: JSON.stringify({ id: currentId, category, content })
    });

    goHome();
}

loadPost();
