const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Campusphere backend is running!");
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Campusphere API is working!"
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });
    
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});