const Event = require("./models/Event");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["student", "faculty"],
            required: true
        },

        department: {
            type: String,
            default: ""
        },

        semester: {
            type: String,
            default: ""
        },

        facultyId: {
            type: String,
            default: ""
        },

        designation: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);