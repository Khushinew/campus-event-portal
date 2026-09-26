const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Event = require("./models/Event");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    // Check whether the token was provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Make the decoded user information available to the route
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
}

const PORT = 5000;

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
    res.send("Campusphere backend is running!");
});

// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        message: "Campusphere API is working!"
    });
});

// ===============================
// REGISTER
// ===============================

app.post("/api/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            department,
            semester,
            facultyId,
            designation
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            department,
            semester,
            facultyId,
            designation
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// ===============================
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({
            message: "Login successful",

            message:"Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                semester: user.semester,
                facultyId: user.facultyId,
                designation: user.designation
            }
        });
            
        

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

// ===============================
// CREATE EVENT
// ===============================

app.post("/api/events", verifyToken, async (req, res) => {
    try {
        // Only faculty can create events
        if (req.user.role !== "faculty") {
            return res.status(403).json({
                message: "Only faculty can create events"
            });
        }

        const {
            title,
            description,
            date,
            time,
            venue,
            category
        } = req.body;

        if (
            !title ||
            !description ||
            !date ||
            !time ||
            !venue ||
            !category
        ) {
            return res.status(400).json({
                message: "Please fill all event fields"
            });
        }

        // Identify the organizer using the verified token
        const faculty = await User.findById(req.user.userId);

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty user not found"
            });
        }

        const newEvent = new Event({
            title,
            description,
            date,
            time,
            venue,
            category,
            organizer: faculty._id,
            organizerName: faculty.name
        });

        await newEvent.save();

        res.status(201).json({
            message: "Event created successfully",
            event: newEvent
        });

    } catch (error) {
        console.error("Create event error:", error);

        res.status(500).json({
            message: "Failed to create event",
            error: error.message
        });
    }
});

// ===============================
// GET FACULTY EVENTS
// ===============================

app.get("/api/events/faculty/:facultyId", async (req, res) => {
    try {
        const events = await Event.find({
            organizer: req.params.facultyId
        }).sort({ createdAt: -1 });

        res.status(200).json(events);

    } catch (error) {
        console.error("Get faculty events error:", error);

        res.status(500).json({
            message: "Failed to fetch events",
            error: error.message
        });
    }
});

// ===============================
// GET ALL EVENTS
// ===============================

app.get("/api/events", async (req, res) => {
    try {
        const events = await Event.find()
            .populate("organizer", "name email department")
            .sort({ createdAt: -1 });

        res.status(200).json(events);

    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            message: "Failed to fetch events",
            error: error.message
        });
    }
});

// ===============================
// DELETE EVENT
// ===============================

app.delete("/api/events/:eventId", async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        await Event.findByIdAndDelete(req.params.eventId);

        res.status(200).json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.error("Delete event error:", error);

        res.status(500).json({
            message: "Failed to delete event",
            error: error.message
        });
    }
});

// ===============================
// MONGODB
// ===============================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

// ===============================
// SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});