document.getElementById("captureBtn").addEventListener("click", async () => {

    try {
        // Capture screen
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: "screen" }
        });

        const track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);
        const bitmap = await imageCapture.grabFrame();

        // Draw image on canvas
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);

        // Convert to blob
        canvas.toBlob(async (blob) => {
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            // Upload to server
            const res = await fetch("/upload", {
                method: "POST",
                body: buffer
            });

            const data = await res.json();
            console.log("Saved:", data.file);

            // Preview
            const url = URL.createObjectURL(blob);
            const img = document.getElementById("previewImage");
            img.src = url;
            img.style.display = "block";

            track.stop();
        });

    } catch (err) {
        alert("Screen capture cancelled or not allowed.");
    }
});
