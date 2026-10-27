const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    studentName: {
      type: String,
      default: "",
    },
    studentEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      default: "",
    },
    semester: {
      type: String,
      default: "",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
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
    domain: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    participationFeeRequired: {
      type: Boolean,
      default: false,
    },
    participationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ["", "Online", "Offline"],
      default: "",
    },
    facultyId: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "",
    },
    registrations: {
      type: [registrationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);