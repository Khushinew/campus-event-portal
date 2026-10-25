
const express = require("express");
const mongoose = require("mongoose");
const PersonalEvent = require("../models/PersonalEvent");

const router = express.Router();

// Get personal events for the logged-in student
router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can access personal events.",
      });
    }

    const events = await PersonalEvent.find({
      studentId: req.user.userId,
    }).sort({ date: 1, time: 1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("Fetch personal events error:", error);
    res.status(500).json({
      message: "Failed to fetch personal events.",
    });
  }
});

// Save a personal event
router.post("/", async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can add personal events.",
      });
    }

    const {
      title,
      date,
      displayDate,
      time,
      duration,
      location,
      description,
    } = req.body;

    if (!title?.trim() || !date || !time?.trim()) {
      return res.status(400).json({
        message: "Title, date, and time are required.",
      });
    }

    if (!mongoose.isValidObjectId(req.user.userId)) {
      return res.status(401).json({
        message: "Invalid user token. Please log in again.",
      });
    }

    const event = await PersonalEvent.create({
      studentId: req.user.userId,
      title: title.trim(),
      date,
      displayDate: displayDate || "",
      time: time.trim(),
      duration: duration || "",
      location: location || "",
      description: description || "",
    });

    res.status(201).json({
      message: "Personal event saved successfully.",
      event,
    });
  } catch (error) {
    console.error("Save personal event error:", error);
    res.status(500).json({
      message: "Failed to save personal event.",
    });
  }
});

// Delete a personal event belonging to the logged-in student
router.delete("/:id", async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can delete personal events.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    const event = await PersonalEvent.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user.userId,
    });

    if (!event) {
      return res.status(404).json({
        message: "Personal event not found.",
      });
    }

    res.status(200).json({
      message: "Personal event deleted successfully.",
    });
  } catch (error) {
    console.error("Delete personal event error:", error);
    res.status(500).json({
      message: "Failed to delete personal event.",
    });
  }
});

module.exports = router;
