const publishBtn = document.getElementById("publishBtn");
const blogList = document.getElementById("blogList");

async function fetchBlogs() {
  const res = await fetch("/blogs");
  const blogs = await res.json();
  displayBlogs(blogs);
}

function displayBlogs(blogs) {
  blogList.innerHTML = blogs.length
    ? blogs.map(b => `
      <div class="blog-card">
        <h3>${b.title}</h3>
        <p>${b.content}</p>
        <div class="blog-footer">
          <span>📅 ${b.date}</span>
          <button class="delete-btn" onclick="deleteBlog(${b.id})">Delete</button>
        </div>
      </div>
    `).join("")
    : "<p>No blogs published yet.</p>";
}

publishBtn.onclick = async () => {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) return alert("Please fill in all fields!");

  await fetch("/add-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  fetchBlogs();
};

async function deleteBlog(id) {
  if (confirm("Are you sure you want to delete this blog?")) {
    await fetch(`/delete-blog?id=${id}`, { method: "DELETE" });
    fetchBlogs();
  }
}

fetchBlogs();
