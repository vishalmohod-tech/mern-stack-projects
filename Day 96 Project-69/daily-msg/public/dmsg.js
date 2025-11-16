function getMessage() {
  fetch("/message")
    .then(res => res.json())
    .then(data => {
      document.getElementById("output").innerText = data.message;
    });
}
