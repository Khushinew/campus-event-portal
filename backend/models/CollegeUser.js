const mongoose = require("mongoose");

const collegeUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    role: {
        type: String,
        enum: ["student", "faculty"],
        required: true
    },

    studentId: {
        type: String,
        default: ""
    },

    facultyId: {
        type: String,
        default: ""
    },

    department: {
        type: String,
        default: ""
    },

    semester: {
        type: String,
        default: ""
    },

    designation: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("CollegeUser", collegeUserSchema);