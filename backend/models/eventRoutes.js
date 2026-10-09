const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");

const router = express.Router();

const isValidId = (id) => mongoose.isValidObjectId(id);

// GET all events (student event listing)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET events created by a faculty member
router.get("/faculty/:facultyId", async (req, res) => {
  try {
    const events = await Event.find({
      facultyId: req.params.facultyId,
    }).sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch faculty events" });
  }
});

// GET registrations made by a student
router.get("/student/:studentId", async (req, res) => {
  try {
    const events = await Event.find({
      "registrations.studentId": req.params.studentId,
    });

    res.json(
      events.map((event) => ({
        ...event.toObject(),
        registrations: event.registrations.filter(
          (registration) =>
            registration.studentId === req.params.studentId
        ),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student registrations" });
  }
});

// GET one event
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
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

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

// UPDATE an event
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
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
        const targetField = field === "maxStudents" ? "capacity" : field;
        updates[targetField] = req.body[field];
      }
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
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      updates.capacity !== undefined &&
      updates.capacity < event.registrations.length
    ) {
      return res.status(400).json({
        message: "Capacity cannot be lower than existing registrations",
      });
    }

    Object.assign(event, updates);
    await event.save();

    res.json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update event" });
  }
});

// GET all registrations for one event
router.get("/:id/registrations", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event.registrations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

// REGISTER a student for an event
router.post("/:id/register", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const { studentId, studentName, studentEmail, department } = req.body;

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
      return res.status(404).json({ message: "Event not found" });
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

    res.status(201).json({
      message: "Registration successful",
      registration: event.registrations[event.registrations.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register for event" });
  }
});

module.exports = router;