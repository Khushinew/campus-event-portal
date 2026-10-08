const dns = require("dns");

// Use Google Public DNS
dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

console.log("Using Google DNS:", dns.getServers());

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Event = require("./models/Event");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CollegeUser = require("./models/CollegeUser");
const path = require("path");
const PORT = 5000;
const DEFAULT_INITIAL_PASSWORD = "Campus@123";
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_event_db');
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
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const normalizedEmail =
            String(email || "").trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: "Please provide your email and password."
            });
        }

        // -----------------------------------
        // STEP 1:
        // Check college directory
        // -----------------------------------

        const collegeUser = await CollegeUser.findOne({
            email: normalizedEmail
        });

        if (!collegeUser) {

            return res.status(404).json({
                message:
                    "This email is not registered in the college directory."
            });
        }

        // -----------------------------------
        // STEP 2:
        // Check Campusphere account
        // -----------------------------------

        let user = await User.findOne({
            email: normalizedEmail
        });

        // -----------------------------------
        // FIRST LOGIN
        // -----------------------------------

        if (!user) {

            // First-time user must use
            // the default password
            if (password !== DEFAULT_INITIAL_PASSWORD) {

                return res.status(401).json({
                    message:
                        "Invalid email or password."
                });
            }

            // Create Campusphere account
            // using information from CollegeUser
            const hashedPassword =
                await bcrypt.hash(
                    DEFAULT_INITIAL_PASSWORD,
                    10
                );

            user = new User({

                email: normalizedEmail,

                password: hashedPassword,

                role: collegeUser.role,

                mustChangePassword: true
            });

            await user.save();

            return res.status(200).json({

                message:
                    "First login successful. Please create a new password.",

                firstLogin: true,

                email: normalizedEmail

            });
        }

        // -----------------------------------
        // REGULAR LOGIN
        // -----------------------------------

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordCorrect) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });
        }

        // -----------------------------------
        // If the user has not changed their
        // default password yet
        // -----------------------------------

        if (user.mustChangePassword) {

            return res.status(200).json({

                message:
                    "Please change your password first.",

                firstLogin: true,

                email: normalizedEmail
            });
        }

        // -----------------------------------
        // REGULAR SUCCESSFUL LOGIN
        // -----------------------------------

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({

            message: "Login successful",

            token: token,

            user: {

                id: user._id,

                name: collegeUser.name,

                email: user.email,

                role: user.role,

                department: collegeUser.department,

                semester: collegeUser.semester,

                studentId: collegeUser.studentId,

                facultyId: collegeUser.facultyId,

                designation: collegeUser.designation
            }
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            message: "Login failed."
        });
    }
});

app.post("/api/change-password", async (req, res) => {

    try {

        const {
            email,
            newPassword
        } = req.body;

        const normalizedEmail =
            String(email || "").trim().toLowerCase();

        if (!normalizedEmail || !newPassword) {

            return res.status(400).json({
                message:
                    "Email and new password are required."
            });
        }

        if (newPassword.length < 8) {

            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long."
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {

            return res.status(404).json({
                message:
                    "User account not found."
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        user.password =
            hashedPassword;

        user.mustChangePassword =
            false;

        await user.save();

        res.status(200).json({
            message:
                "Password changed successfully."
        });

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to change password."
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