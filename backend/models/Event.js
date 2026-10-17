
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      min: 1,
      default: 100,
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    organizerName: {
      type: String,
      default: "Campusphere Events",
    },

    registrations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);