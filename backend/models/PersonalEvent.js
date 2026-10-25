
const mongoose = require("mongoose");

const personalEventSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    displayDate: {
      type: String,
      default: "",
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, collection: "personal_events" }
);

module.exports = mongoose.model("PersonalEvent", personalEventSchema);
