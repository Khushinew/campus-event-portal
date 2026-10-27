
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "faculty"],
      required: true,
    },

    department: {
      type: String,
      default: "",
    },

    studentId: {
      type: String,
      default: "",
      trim: true,
    },

    semester: {
      type: String,
      default: "",
    },

    facultyId: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    securityQuestion: {
      type: String,
      enum: [
        "",
        "What was the name of your favorite pet?",
        "What was the name of your first school?",
        "Who was your best friend?",
        "What is your favorite memory place?",
        "What was the name of your first company?",
      ],
      default: "",
    },

    securityAnswerHash: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);