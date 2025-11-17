// Search button
document.getElementById("searchBtn").addEventListener("click", () => {
    searchWord();
});

// Example word buttons
document.querySelectorAll(".tag").forEach(btn => {
    btn.addEventListener("click", () => {
        document.getElementById("wordInput").value = btn.innerText;
        searchWord();
    });
});

// Function to fetch meaning
function searchWord() {
    const word = document.getElementById("wordInput").value.trim();

    if (word === "") {
        document.getElementById("result").innerHTML =
            "<p style='color:red;'>Please enter a word!</p>";
        return;
    }

    fetch(`/define/${word}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById("result").innerHTML =
                    `<p style="color:red">${data.error}</p>`;
            } else {
                document.getElementById("result").innerHTML =
                    `<h2>${data.word}</h2><p>${data.meaning}</p>`;
            }
        })
        .catch(() => {
            document.getElementById("result").innerHTML =
                "<p style='color:red;'>Something went wrong!</p>";
        });
}
