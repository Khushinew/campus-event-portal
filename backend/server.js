
const dns = require("dns");

// Use Google Public DNS for hostname resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const User = require("./models/User");
const Event = require("./models/Event");
const CollegeUser = require("./models/CollegeUser");

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_INITIAL_PASSWORD = "Campus@123";
const CAMPUS_DOMAIN = "campus.edu.in";

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json());

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "JWT_SECRET is not configured.",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        message: `Only ${role}s can access this resource.`,
      });
    }

    next();
  };
}

function validObjectId(id) {
  return mongoose.isValidObjectId(id);
}

function getCampusRole(email) {
  const escapedDomain = CAMPUS_DOMAIN.replace(/\./g, "\\.");

  const studentEmail = new RegExp(
    `^\\d{2}(?:bba|mba|ace|bt|bio|dd)04(?:0\\d{2}|1\\d{2}|200)@${escapedDomain}$`
  );

  const facultyEmail = new RegExp(
    `^[a-z]+\\.[a-z]+@${escapedDomain}$`
  );

  if (studentEmail.test(email)) return "student";
  if (facultyEmail.test(email)) return "faculty";

  return null;
}

// =====================================
// HOME AND TEST
// =====================================

app.get("/", (req, res) => {
  res.send("Campusphere backend is running!");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Campusphere API is working!",
  });
});

// =====================================
// LOGIN
// POST /api/login
// =====================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Please provide your campus email and password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured.",
      });
    }

    const emailRole = getCampusRole(normalizedEmail);

    if (!emailRole) {
      return res.status(400).json({
        message:
          "Use a valid faculty or student email ending in @campus.edu.in.",
      });
    }

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // Create the local account from the college directory
    // when the user logs in for the first time.
    if (!user) {
      const collegeUser = await CollegeUser.findOne({
        email: normalizedEmail,
      });

      if (!collegeUser) {
        return res.status(404).json({
          message: "User not found in the college directory.",
        });
      }

      if (collegeUser.role !== emailRole) {
        return res.status(403).json({
          message:
            "This email format does not match the role in the college directory.",
        });
      }

      if (password !== DEFAULT_INITIAL_PASSWORD) {
        return res.status(401).json({
          message: "Invalid email or password.",
        });
      }

      user = new User({
        name: collegeUser.name,
        email: collegeUser.email,
        password: await bcrypt.hash(DEFAULT_INITIAL_PASSWORD, 10),
        role: collegeUser.role,
        department: collegeUser.department || "",
        semester: collegeUser.semester || "",
        facultyId: collegeUser.facultyId || "",
        designation: collegeUser.designation || "",
      });

      try {
        await user.save();
      } catch (error) {
        if (error.code !== 11000) throw error;

        user = await User.findOne({
          email: normalizedEmail,
        });

        if (!user) throw error;
      }
    }

    if (user.role !== emailRole) {
      return res.status(403).json({
        message: "This email format does not match the account role.",
      });
    }

    // Preserve the existing initial-password login behavior.
    // This should be replaced with a proper password-change flow.
    if (password !== DEFAULT_INITIAL_PASSWORD) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (
      !user.password ||
      !(await bcrypt.compare(DEFAULT_INITIAL_PASSWORD, user.password))
    ) {
      user.password = await bcrypt.hash(DEFAULT_INITIAL_PASSWORD, 10);
      await user.save();
    }

    const token = jwt.sign(
      {
        userId: String(user._id),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        facultyId: user.facultyId,
        designation: user.designation,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

// =====================================
// CREATE EVENT
// POST /api/events
// =====================================

app.post(
  "/api/events",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        date,
        time,
        venue,
        category,
        capacity,
        maxStudents,
        max_participants,
      } = req.body;

      if (
        !title?.trim() ||
        !description?.trim() ||
        !date ||
        !time ||
        !venue?.trim() ||
        !category
      ) {
        return res.status(400).json({
          message: "Please fill all required event fields.",
        });
      }

      const faculty = await User.findById(req.user.userId);

      if (!faculty || faculty.role !== "faculty") {
        return res.status(404).json({
          message: "Faculty user not found.",
        });
      }

      const requestedCapacity = Number(
        capacity ?? maxStudents ?? max_participants ?? 100
      );

      if (
        !Number.isInteger(requestedCapacity) ||
        requestedCapacity < 1
      ) {
        return res.status(400).json({
          message: "Capacity must be a positive whole number.",
        });
      }

      const event = await Event.create({
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        venue: venue.trim(),
        category,
        capacity: requestedCapacity,
        organizer: faculty._id,
        organizerName: faculty.name || faculty.email,
        registrations: [],
      });

      res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      console.error("Create event error:", error);

      res.status(500).json({
        message: "Failed to create event.",
      });
    }
  }
);

// =====================================
// GET ALL EVENTS
// GET /api/events
// =====================================

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email department")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      message: "Failed to fetch events.",
    });
  }
});

// =====================================
// GET FACULTY EVENTS
// GET /api/events/faculty/:facultyId
// =====================================

app.get(
  "/api/events/faculty/:facultyId",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      // A faculty member can only fetch their own events.
      if (String(req.user.userId) !== req.params.facultyId) {
        return res.status(403).json({
          message: "You can only view your own events.",
        });
      }

      const events = await Event.find({
        organizer: req.user.userId,
      }).sort({ createdAt: -1 });

      res.json(events);
    } catch (error) {
      console.error("Get faculty events error:", error);

      res.status(500).json({
        message: "Failed to fetch faculty events.",
      });
    }
  }
);

// =====================================
// GET ONE EVENT
// GET /api/events/:eventId
// =====================================

app.get("/api/events/:eventId", async (req, res) => {
  try {
    if (!validObjectId(req.params.eventId)) {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(req.params.eventId)
      .populate("organizer", "name email department");

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    res.json(event);
  } catch (error) {
    console.error("Get event error:", error);

    res.status(500).json({
      message: "Failed to fetch event.",
    });
  }
});

// =====================================
// UPDATE EVENT
// PUT /api/events/:eventId
// =====================================

app.put(
  "/api/events/:eventId",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      if (String(event.organizer) !== String(req.user.userId)) {
        return res.status(403).json({
          message: "You cannot edit another faculty member's event.",
        });
      }

      const fields = [
        "title",
        "description",
        "date",
        "time",
        "venue",
        "category",
      ];

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          event[field] = req.body[field];
        }
      }

      const newCapacity =
        req.body.capacity ??
        req.body.maxStudents ??
        req.body.max_participants;

      if (newCapacity !== undefined) {
        const capacityNumber = Number(newCapacity);

        if (
          !Number.isInteger(capacityNumber) ||
          capacityNumber < 1
        ) {
          return res.status(400).json({
            message: "Capacity must be a positive whole number.",
          });
        }

        if (capacityNumber < event.registrations.length) {
          return res.status(400).json({
            message:
              "Capacity cannot be lower than the current registration count.",
          });
        }

        event.capacity = capacityNumber;
      }

      await event.save();

      res.json({
        message: "Event updated successfully",
        event,
      });
    } catch (error) {
      console.error("Update event error:", error);

      res.status(500).json({
        message: "Failed to update event.",
      });
    }
  }
);

// =====================================
// DELETE EVENT
// DELETE /api/events/:eventId
// =====================================

app.delete(
  "/api/events/:eventId",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      if (String(event.organizer) !== String(req.user.userId)) {
        return res.status(403).json({
          message: "You cannot delete another faculty member's event.",
        });
      }

      await event.deleteOne();

      res.json({
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Delete event error:", error);

      res.status(500).json({
        message: "Failed to delete event.",
      });
    }
  }
);

// =====================================
// MONITOR EVENT REGISTRATIONS
// GET /api/events/:eventId/registrations
// =====================================

app.get(
  "/api/events/:eventId/registrations",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const event = await Event.findById(req.params.eventId)
        .populate(
          "registrations",
          "name email department semester facultyId"
        );

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      if (String(event.organizer) !== String(req.user.userId)) {
        return res.status(403).json({
          message: "You cannot view registrations for this event.",
        });
      }

      res.json(event.registrations);
    } catch (error) {
      console.error("Fetch registrations error:", error);

      res.status(500).json({
        message: "Failed to fetch registrations.",
      });
    }
  }
);

// =====================================
// REGISTER FOR EVENT
// POST /api/events/:eventId/register
// =====================================

app.post(
  "/api/events/:eventId/register",
  verifyToken,
  requireRole("student"),
  async (req, res) => {
    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const student = await User.findById(req.user.userId);

      if (!student || student.role !== "student") {
        return res.status(404).json({
          message: "Student account not found.",
        });
      }

      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      const alreadyRegistered = event.registrations.some(
        (studentId) => String(studentId) === String(student._id)
      );

      if (alreadyRegistered) {
        return res.status(409).json({
          message: "You are already registered for this event.",
        });
      }

      if (
        Number.isFinite(Number(event.capacity)) &&
        event.registrations.length >= Number(event.capacity)
      ) {
        return res.status(409).json({
          message: "This event has reached its registration capacity.",
        });
      }

      event.registrations.push(student._id);
      await event.save();

      res.status(201).json({
        message: "Registration successful",
        eventId: event._id,
      });
    } catch (error) {
      console.error("Student registration error:", error);

      res.status(500).json({
        message: "Failed to register for event.",
      });
    }
  }
);

// =====================================
// GET STUDENT'S REGISTERED EVENTS
// GET /api/student/registrations
// =====================================

app.get(
  "/api/student/registrations",
  verifyToken,
  requireRole("student"),
  async (req, res) => {
    try {
      const events = await Event.find({
        registrations: req.user.userId,
      })
        .populate("organizer", "name email department")
        .sort({ date: 1 });

      res.json(events);
    } catch (error) {
      console.error("Student registrations error:", error);

      res.status(500).json({
        message: "Failed to fetch student registrations.",
      });
    }
  }
);

// =====================================
// GET MY PROFILE
// GET /api/profile
// =====================================

app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to fetch profile.",
    });
  }
});

// =====================================
// UPDATE MY PROFILE
// PUT /api/profile
// =====================================

app.put("/api/profile", verifyToken, async (req, res) => {
  try {
    const { name, department } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          message: "Name cannot be empty.",
        });
      }

      updates.name = String(name).trim();
    }

    if (department !== undefined) {
      updates.department = String(department).trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No profile fields were provided to update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role === "faculty" && user.name) {
      await Event.updateMany(
        { organizer: user._id },
        { $set: { organizerName: user.name } }
      );
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile.",
    });
  }
});

// =====================================
// START SERVER AFTER MONGODB CONNECTS
// =====================================

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in backend/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();