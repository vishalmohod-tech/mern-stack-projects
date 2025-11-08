document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const text = document.getElementById("textInput").value;

  const res = await fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (res.ok) {
    const data = await res.json();
    document.getElementById("wordCount").textContent = data.wordCount;
    document.getElementById("charCount").textContent = data.charCount;
    document.getElementById("sentenceCount").textContent = data.sentenceCount;
    document.getElementById("longestWord").textContent = data.longestWord;
    document.getElementById("mostRepeated").textContent = data.mostRepeated;
    document.getElementById("results").classList.remove("hidden");
  } else {
    alert("Error analyzing text!");
  }
});
