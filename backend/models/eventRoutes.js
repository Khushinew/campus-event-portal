
const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");

// IMPORTANT:
// Update this import to match your actual authentication middleware.
// It must verify the Bearer token and set req.user.
// Example only:
// const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const isValidId = (id) => mongoose.isValidObjectId(id);

// GET all events (student event listing)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.json(events);
  } catch (error) {
    console.error("Fetch events error:", error);
    return res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});

// GET events created by a faculty member
router.get("/faculty/:facultyId", async (req, res) => {
  try {
    const events = await Event.find({
      facultyId: String(req.params.facultyId),
    }).sort({ createdAt: -1 });

    return res.json(events);
  } catch (error) {
    console.error("Fetch faculty events error:", error);
    return res.status(500).json({
      message: "Failed to fetch faculty events",
    });
  }
});

// GET registrations made by a student
router.get("/student/:studentId", async (req, res) => {
  try {
    const studentId = String(req.params.studentId);

    const events = await Event.find({
      "registrations.studentId": studentId,
    });

    return res.json(
      events.map((event) => ({
        ...event.toObject(),
        registrations: event.registrations.filter(
          (registration) => registration.studentId === studentId
        ),
      }))
    );
  } catch (error) {
    console.error("Fetch student registrations error:", error);
    return res.status(500).json({
      message: "Failed to fetch student registrations",
    });
  }
});

// GET one event
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.json(event);
  } catch (error) {
    console.error("Fetch event error:", error);
    return res.status(500).json({
      message: "Failed to fetch event",
    });
  }
});

// CREATE an event
router.post("/", async (req, res) => {
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
      facultyId,
      createdBy,
    } = req.body;

    if (
      !title?.trim() ||
      !date ||
      !time ||
      !venue?.trim() ||
      !category ||
      !facultyId
    ) {
      return res.status(400).json({
        message: "Please provide all required event details",
      });
    }

    const eventCapacity = Number(capacity ?? maxStudents);

    if (!Number.isInteger(eventCapacity) || eventCapacity < 1) {
      return res.status(400).json({
        message: "Capacity must be a positive whole number",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description || "",
      date,
      time,
      venue: venue.trim(),
      category,
      capacity: eventCapacity,
      facultyId: String(facultyId),
      createdBy: createdBy || "",
    });

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({
      message: "Failed to create event",
    });
  }
});

// UPDATE an event
// IMPORTANT: Add your real authentication middleware to this route.
// It must validate the token and populate req.user.
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({
        message:
          "User authentication is missing. Configure the authentication middleware.",
      });
    }

    if (loggedInUser.role !== "faculty") {
      return res.status(403).json({
        message: "Only faculty members can edit events.",
      });
    }

    const loggedInFacultyId = String(
      loggedInUser.id ||
      loggedInUser._id ||
      loggedInUser.userId ||
      ""
    );

    if (!loggedInFacultyId) {
      return res.status(401).json({
        message: "Could not identify the logged-in faculty member.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    console.log("Logged-in faculty ID:", loggedInFacultyId);
    console.log("Event owner facultyId:", String(event.facultyId));

    if (String(event.facultyId) !== loggedInFacultyId) {
      return res.status(403).json({
        message: "You cannot edit another faculty member's event.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "date",
      "time",
      "venue",
      "category",
      "capacity",
      "maxStudents",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        const targetField =
          field === "maxStudents" ? "capacity" : field;

        updates[targetField] = req.body[field];
      }
    }

    if (updates.title !== undefined) {
      if (
        typeof updates.title !== "string" ||
        !updates.title.trim()
      ) {
        return res.status(400).json({
          message: "Event title is required.",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.venue !== undefined) {
      if (
        typeof updates.venue !== "string" ||
        !updates.venue.trim()
      ) {
        return res.status(400).json({
          message: "Venue is required.",
        });
      }

      updates.venue = updates.venue.trim();
    }

    if (updates.capacity !== undefined) {
      updates.capacity = Number(updates.capacity);

      if (
        !Number.isInteger(updates.capacity) ||
        updates.capacity < 1
      ) {
        return res.status(400).json({
          message: "Capacity must be a positive whole number",
        });
      }

      if (updates.capacity < event.registrations.length) {
        return res.status(400).json({
          message:
            "Capacity cannot be lower than existing registrations",
        });
      }
    }

    Object.assign(event, updates);
    await event.save();

    return res.json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({
      message: "Failed to update event",
    });
  }
});

// GET all registrations for one event
router.get("/:id/registrations", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.json(event.registrations);
  } catch (error) {
    console.error("Fetch registrations error:", error);
    return res.status(500).json({
      message: "Failed to fetch registrations",
    });
  }
});

// REGISTER a student for an event
router.post("/:id/register", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const {
      studentId,
      studentName,
      studentEmail,
      department,
    } = req.body;

    if (
      !studentId ||
      !studentName?.trim() ||
      !studentEmail?.trim()
    ) {
      return res.status(400).json({
        message: "Student ID, name, and email are required",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const normalizedEmail = studentEmail.trim().toLowerCase();

    const alreadyRegistered = event.registrations.some(
      (registration) =>
        registration.studentId === String(studentId) ||
        registration.studentEmail === normalizedEmail
    );

    if (alreadyRegistered) {
      return res.status(409).json({
        message: "You are already registered for this event",
      });
    }

    if (event.registrations.length >= event.capacity) {
      return res.status(409).json({
        message: "This event has reached its registration capacity",
      });
    }

    event.registrations.push({
      studentId: String(studentId),
      studentName: studentName.trim(),
      studentEmail: normalizedEmail,
      department: department || "",
    });

    await event.save();

    return res.status(201).json({
      message: "Registration successful",
      registration:
        event.registrations[event.registrations.length - 1],
    });
  } catch (error) {
    console.error("Register student error:", error);
    return res.status(500).json({
      message: "Failed to register for event",
    });
  }
});

module.exports = router;
