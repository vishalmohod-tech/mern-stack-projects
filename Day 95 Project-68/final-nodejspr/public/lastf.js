async function loadPosts() {
    const res = await fetch("/api/content");
    const data = await res.json();

    const box = document.getElementById("posts");
    box.innerHTML = "";

    data.forEach(p => {
        box.innerHTML += `
            <div class="post-card" onclick="openPost('${p.title}')">
                <h3>${p.title}</h3>
                <p>${p.body.substring(0, 100)}...</p>
            </div>
        `;
    });
}

loadPosts();

async function createContent() {
    const title = document.getElementById("title").value;
    const body = document.getElementById("body").value;

    await fetch("/api/create", {
        method: "POST",
        body: JSON.stringify({ title, body })
    });

    loadPosts();
}

function openPost(title) {
    location.href = `/view.html?title=${title}`;
}


if (location.pathname.includes("view.html")) {
    (async () => {
        const params = new URLSearchParams(location.search);
        const title = params.get("title");

        const all = await (await fetch("/api/content")).json();
        const post = all.find(p => p.title === title);

        document.getElementById("post").innerHTML = `
            <h1>${post.title}</h1>
            <p>${post.body}</p>
        `;

        document.getElementById("editTitle").value = post.title;
        document.getElementById("editBody").value = post.body;
    })();
}

async function updatePost() {
    const params = new URLSearchParams(location.search);
    const oldTitle = params.get("title");

    const title = document.getElementById("editTitle").value;
    const body = document.getElementById("editBody").value;

    await fetch("/api/update", {
        method: "PUT",
        body: JSON.stringify({ oldTitle, title, body })
    });

    location.href = "/";
}


async function deletePost() {
    const params = new URLSearchParams(location.search);
    const title = params.get("title");

    await fetch(`/api/delete?title=${title}`, { method: "DELETE" });

    location.href = "/";
}


function searchContent() {
    let value = document.getElementById("search").value.toLowerCase();
    document.querySelectorAll(".post-card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(value)
            ? "block" : "none";
    });
}
