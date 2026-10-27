const mongoose = require("mongoose");

const personalSecurityQuestionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      enum: [
        "What was the name of your favorite pet?",
        "What was the name of your first school?",
        "Who was your best friend?",
        "What is your favorite memory place?",
        "What was the name of your first company?",
      ],
    },
    answerHash: {
      type: String,
      required: true,
      select: false,
    },
    resetTokenHash: {
      type: String,
      default: "",
      select: false,
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    resetFailedAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    resetLockedUntil: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PersonalSecurityQuestion",
  personalSecurityQuestionSchema
);
