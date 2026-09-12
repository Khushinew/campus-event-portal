const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Campusphere backend is running!");
});

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role
});

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
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