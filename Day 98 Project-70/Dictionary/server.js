const express = require("express");
const path = require("path");
const data = require("./data.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/define/:word", (req, res) => {
    const word = req.params.word.toLowerCase();

    if (data[word]) {
        return res.json({
            word,
            meaning: data[word]
        });
    }

    res.status(404).json({
        error: "Word not found in dictionary"
    });
});

app.get("/all", (req, res) => {
    res.json(data);
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dict.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
