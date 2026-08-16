const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Campusphere backend is running!");
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Campusphere API is working!"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});