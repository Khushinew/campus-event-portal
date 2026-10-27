
const dns = require("dns");

// Use Google Public DNS for hostname resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const personalEventRoutes = require("./models/personalEventRoutes");


require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const User = require("./models/User");
const Event = require("./models/Event");
console.log("Event model file:", require.resolve("./models/Event"));

console.log(
  "Event schema fields:",
  Object.keys(Event.schema.paths)
);

console.log(
  "organizer required:",
  Event.schema.path("organizer")?.isRequired
);

console.log(
  "organizerName required:",
  Event.schema.path("organizerName")?.isRequired
);
const CollegeUser = require("./models/CollegeUser");

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_INITIAL_PASSWORD = "Campus@123";
const CAMPUS_DOMAIN = "campus.edu.in";

const uploadDirectory = path.join(__dirname, "uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WebP images are allowed."));
    }
  },
});

app.use("/uploads", express.static(uploadDirectory));

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json());

// Personal calendar API
app.use(
  "/api/personal-events",
  verifyToken,
  personalEventRoutes
);
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "JWT_SECRET is not configured.",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        message: `Only ${role}s can access this resource.`,
      });
    }

    next();
  };
}

function validObjectId(id) {
  return mongoose.isValidObjectId(id);
}

function studentDepartmentPattern(department) {
  const patterns = {
    BBA: /^\s*(?:BBA|Bachelor(?:s)?\s+of\s+Business\s+Administration)(?:\s+.*)?\s*$/i,
    BTech: /^\s*(?:B\.?\s*Tech|BT|Bachelor(?:s)?\s+of\s+Technology)(?:\s+.*)?\s*$/i,
    BCA: /^\s*(?:BCA|Bachelor(?:s)?\s+of\s+Computer\s+Applications)(?:\s+.*)?\s*$/i,
    Chemical: /^\s*Chemical(?:\s+.*)?\s*$/i,
    MBA: /^\s*(?:MBA|Master(?:s)?\s+of\s+Business\s+Administration)(?:\s+.*)?\s*$/i,
    Biotech: /^\s*(?:Bio(?:tech(?:nology)?)?|Biotechnology)(?:\s+.*)?\s*$/i,
    MSc: /^\s*(?:M\.?\s*Sc(?:ience)?|Master(?:s)?\s+of\s+Science)(?:\s+.*)?\s*$/i,
  };

  return patterns[department] || null;
}

function eventSummary(event) {
  const summary = event.toObject ? event.toObject() : { ...event };
  const registrationCount = Array.isArray(summary.registrations)
    ? summary.registrations.length
    : 0;

  delete summary.registrations;
  summary.registrationCount = registrationCount;
  summary.seatsRemaining = Math.max(
    Number(summary.capacity || 0) - registrationCount,
    0
  );
  summary.isFull = registrationCount >= Number(summary.capacity || 0);

  return summary;
}

function getCampusRole(email) {
  const escapedDomain = CAMPUS_DOMAIN.replace(/\./g, "\\.");

  const studentEmail = new RegExp(
    `^\\d{2}(?:bba|mba|ace|bt|bio|dd)04(?:0\\d{2}|1\\d{2}|200)@${escapedDomain}$`
  );

  const facultyEmail = new RegExp(
    `^[a-z]+\\.[a-z]+@${escapedDomain}$`
  );

  if (studentEmail.test(email)) return "student";
  if (facultyEmail.test(email)) return "faculty";

  return null;
}

// =====================================
// HOME AND TEST
// =====================================

app.get("/", (req, res) => {
  res.send("Campusphere backend is running!");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Campusphere API is working!",
  });
});

// =====================================
// LOGIN
// POST /api/login
// =====================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Please provide your campus email and password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured.",
      });
    }

    const emailRole = getCampusRole(normalizedEmail);

    if (!emailRole) {
      return res.status(400).json({
        message:
          "Use a valid faculty or student email ending in @campus.edu.in.",
      });
    }

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // Create an account the first time a directory user logs in.
    if (!user) {
      const collegeUser = await CollegeUser.findOne({
        email: normalizedEmail,
      });

      if (!collegeUser) {
        return res.status(404).json({
          message: "User not found in the college directory.",
        });
      }

      if (collegeUser.role !== emailRole) {
        return res.status(403).json({
          message:
            "This email format does not match the role in the college directory.",
        });
      }

      // The initial password is allowed only when creating the account.
      if (password !== DEFAULT_INITIAL_PASSWORD) {
        return res.status(401).json({
          message: "Invalid email or password.",
        });
      }

      user = new User({
        name: collegeUser.name,
        email: normalizedEmail,
        password: await bcrypt.hash(DEFAULT_INITIAL_PASSWORD, 10),
        role: collegeUser.role,
        studentId: collegeUser.studentId || "",
        department: collegeUser.department || "",
        semester: collegeUser.semester || "",
        facultyId: collegeUser.facultyId || "",
        designation: collegeUser.designation || "",
        mustChangePassword: true,
      });

      try {
        await user.save();
      } catch (error) {
        // Handle two first-login requests arriving simultaneously.
        if (error.code !== 11000) {
          throw error;
        }

        user = await User.findOne({
          email: normalizedEmail,
        });

        if (!user) {
          throw error;
        }
      }
    }

    if (user.role !== emailRole) {
      return res.status(403).json({
        message: "This email format does not match the account role.",
      });
    }

    // Verify the password stored in the database.
    // Existing accounts can now use their changed passwords.
    const passwordMatches = await bcrypt.compare(
      password,
      user.password || ""
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const directoryStudent =
      user.role === "student"
        ? await CollegeUser.findOne({ email: normalizedEmail }).select("studentId")
        : null;
    const studentId = user.studentId || directoryStudent?.studentId || "";

    const token = jwt.sign(
      {
        userId: String(user._id),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      firstLogin: Boolean(user.mustChangePassword),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId,
        department: user.department,
        semester: user.semester,
        facultyId: user.facultyId,
        designation: user.designation,
        mustChangePassword: Boolean(user.mustChangePassword),
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});


app.post("/api/change-password", verifyToken, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        message: "Your new password must contain at least 8 characters.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Don't allow the initial password to remain unchanged.
    if (newPassword === DEFAULT_INITIAL_PASSWORD) {
      return res.status(400).json({
        message: "Please choose a password different from the initial password.",
      });
    }

    // Hash and save the new password in MongoDB.
    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Failed to change password.",
    });
  }
});


// =====================================
// CREATE EVENT
// POST /api/events
// =====================================

app.post(
  "/api/events",
  verifyToken,
  requireRole("faculty"),
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        date,
        time,
        venue,
        category,
        domain,
        capacity,
        participationFeeRequired,
        participationFee,
        paymentMode,
        attendanceEnabled,
        attendanceType,
        attendanceDepartment,
        maxStudents,
        max_participants,
      } = req.body;

      if (
        !title?.trim() ||
        !description?.trim() ||
        !date ||
        !time ||
        !venue?.trim() ||
        !category
      ) {
        return res.status(400).json({
          message: "Please fill all required event fields.",
        });
      }

      const faculty = await User.findById(req.user.userId);

      if (!faculty || faculty.role !== "faculty") {
        return res.status(404).json({
          message: "Faculty user not found.",
        });
      }

      const requestedCapacity = Number(
        capacity ?? maxStudents ?? max_participants ?? 100
      );

      if (
        !Number.isInteger(requestedCapacity) ||
        requestedCapacity < 1
      ) {
        return res.status(400).json({
          message: "Capacity must be a positive whole number.",
        });
      }

      const hasParticipationFee = participationFeeRequired === "true";
      if (
        participationFeeRequired !== undefined &&
        participationFeeRequired !== "true" &&
        participationFeeRequired !== "false"
      ) {
        return res.status(400).json({
          message: "Participation fee selection is invalid.",
        });
      }

      const requestedFee = hasParticipationFee
        ? Number(participationFee)
        : 0;
      const normalizedPaymentMode = hasParticipationFee
        ? String(paymentMode || "")
        : "";

      if (
        hasParticipationFee &&
        (!Number.isFinite(requestedFee) ||
          requestedFee <= 0 ||
          !["Online", "Offline"].includes(normalizedPaymentMode))
      ) {
        return res.status(400).json({
          message:
            "Enter a participation fee greater than zero and select Online or Offline payment.",
        });
      }

      const hasAttendanceRequirements = attendanceEnabled === "true";
      if (
        attendanceEnabled !== undefined &&
        attendanceEnabled !== "true" &&
        attendanceEnabled !== "false"
      ) {
        return res.status(400).json({
          message: "Attendance selection is invalid.",
        });
      }

      const normalizedAttendanceType = hasAttendanceRequirements
        ? String(attendanceType || "")
        : "";
      const normalizedAttendanceDepartment =
        hasAttendanceRequirements &&
        ["compulsory", "both"].includes(normalizedAttendanceType)
          ? String(attendanceDepartment || "").trim()
          : "";

      if (
        hasAttendanceRequirements &&
        !["compulsory", "open", "both"].includes(normalizedAttendanceType)
      ) {
        return res.status(400).json({
          message: "Select a valid attendance requirement.",
        });
      }

      if (
        hasAttendanceRequirements &&
        ["compulsory", "both"].includes(normalizedAttendanceType)
      ) {
        if (!normalizedAttendanceDepartment) {
          return res.status(400).json({
            message: "Select the student department for attendance tracking.",
          });
        }

        const departmentPattern = studentDepartmentPattern(
          normalizedAttendanceDepartment
        );
        if (!departmentPattern) {
          return res.status(400).json({
            message: "Select a supported student department.",
          });
        }

        const domainExists = await CollegeUser.exists({
          role: "student",
          department: departmentPattern,
        });

        if (!domainExists) {
          return res.status(400).json({
            message: "The selected student department is not in the college directory.",
          });
        }
      }

      const event = await Event.create({
  title: title.trim(),
  description: description.trim(),
  date,
  time,
  venue: venue.trim(),
  category,
  domain: domain || "",
  capacity: requestedCapacity,
  participationFeeRequired: hasParticipationFee,
  participationFee: requestedFee,
  paymentMode: normalizedPaymentMode,
  attendanceEnabled: hasAttendanceRequirements,
  attendanceType: normalizedAttendanceType,
  attendanceDepartment: normalizedAttendanceDepartment,
  facultyId: String(faculty._id),
  createdBy: faculty.name || faculty.email,
  imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
  registrations: [],
});

      res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
  console.error("Create event error:", error);

  res.status(500).json({
    message: "Failed to create event.",
    error: error.message,
  });
}
  }
);

// =====================================
// GET ALL EVENTS
// GET /api/events
// =====================================

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });

    res.json(events.map(eventSummary));
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      message: "Failed to fetch events.",
    });
  }
});


app.get(
  "/api/events/faculty/:facultyId",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const loggedInFacultyId = String(req.user.userId);
      const requestedFacultyId = String(req.params.facultyId);

      if (loggedInFacultyId !== requestedFacultyId) {
        return res.status(403).json({
          message: "You can only view your own events.",
        });
      }

      const events = await Event.find({
        facultyId: loggedInFacultyId,
      }).sort({ createdAt: -1 });

      console.log("FACULTY EVENTS FETCHED:", {
        facultyId: loggedInFacultyId,
        eventCount: events.length,
        eventIds: events.map((event) => String(event._id)),
      });

      return res.status(200).json(events.map(eventSummary));
    } catch (error) {
      console.error("Get faculty events error:", error);

      return res.status(500).json({
        message: "Failed to fetch faculty events.",
      });
    }
  }
);

// =====================================
// GET ONE EVENT
// GET /api/events/:eventId
// =====================================

app.get("/api/events/:eventId", async (req, res) => {
  try {
    if (!validObjectId(req.params.eventId)) {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    res.json(eventSummary(event));
  } catch (error) {
    console.error("Get event error:", error);

    res.status(500).json({
      message: "Failed to fetch event.",
    });
  }
});

// =====================================
// UPDATE EVENT
// PUT /api/events/:eventId
// =====================================


 
app.put(
  "/api/events/:eventId",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    console.log("UPDATE EVENT ROUTE REACHED");

    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const faculty = await User.findById(req.user.userId);

      if (!faculty || faculty.role !== "faculty") {
        return res.status(404).json({
          message: "Faculty account not found.",
        });
      }

      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      // Use the same ownership field as the My Events route.
      if (String(event.facultyId) !== String(faculty._id)) {
        console.log("EDIT OWNERSHIP MISMATCH:", {
          loggedInUserId: String(faculty._id),
          eventFacultyId: String(event.facultyId),
          eventId: String(event._id),
        });

        return res.status(403).json({
          message:
            "This event does not belong to your faculty account. Please check the event's facultyId in MongoDB.",
        });
      }

      const { date, time, venue, category, domain, capacity } = req.body;

      if (date !== undefined) event.date = date;
      if (time !== undefined) event.time = time;

      if (venue !== undefined) {
        if (!String(venue).trim()) {
          return res.status(400).json({
            message: "Venue cannot be empty.",
          });
        }
        event.venue = String(venue).trim();
      }

      if (category !== undefined) {
        if (!String(category).trim()) {
          return res.status(400).json({
            message: "Category cannot be empty.",
          });
        }
        event.category = String(category).trim();
      }

      if (domain !== undefined) {
        event.domain = String(domain).trim();
      }

      if (capacity !== undefined) {
        const newCapacity = Number(capacity);

        if (!Number.isInteger(newCapacity) || newCapacity < 1) {
          return res.status(400).json({
            message: "Capacity must be a positive whole number.",
          });
        }

        if (newCapacity < event.registrations.length) {
          return res.status(400).json({
            message:
              "Capacity cannot be lower than the current registration count.",
          });
        }

        event.capacity = newCapacity;
      }

      await event.save();

      console.log("EVENT UPDATED SUCCESSFULLY:", String(event._id));

      return res.status(200).json({
        message: "Event updated successfully.",
        event: eventSummary(event),
      });
    } catch (error) {
      console.error("Update event error:", error);

      return res.status(500).json({
        message: "Failed to update event.",
        error: error.message,
      });
    }
  }
);

// =====================================
// DELETE EVENT
// DELETE /api/events/:eventId
// =====================================

app.delete(
  "/api/events/:eventId",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      if (String(event.facultyId) !== String(req.user.userId)) {
        return res.status(403).json({
          message: "You cannot delete another faculty member's event.",
        });
      }

      await event.deleteOne();

      res.json({
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Delete event error:", error);

      res.status(500).json({
        message: "Failed to delete event.",
      });
    }
  }
);
// =====================================
// MONITOR EVENT REGISTRATIONS
// GET /api/events/:eventId/registrations
// =====================================

app.get(
  "/api/events/:eventId/registrations",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      if (String(event.facultyId) !== String(req.user.userId)) {
        return res.status(403).json({
          message: "You cannot view registrations for this event.",
        });
      }

      const legacyUserIds = event.registrations
        .filter(
          (registration) =>
            !registration.userId &&
            !registration.studentEmail &&
            validObjectId(registration._id)
        )
        .map((registration) => registration._id);
      const legacyUsers = legacyUserIds.length
        ? await User.find({ _id: { $in: legacyUserIds } }).select(
            "studentId name email department semester"
          )
        : [];
      const legacyUserById = new Map(
        legacyUsers.map((student) => [String(student._id), student])
      );

      res.json(
        event.registrations.map((registration) => {
          const legacyStudent = legacyUserById.get(
            String(registration._id || "")
          );
          return {
            ...registration.toObject(),
            userId: registration.userId || legacyStudent?._id || null,
            studentId:
              registration.studentId || legacyStudent?.studentId || "",
            studentName:
              registration.studentName || legacyStudent?.name || "",
            studentEmail:
              registration.studentEmail || legacyStudent?.email || "",
            department:
              registration.department || legacyStudent?.department || "",
            semester:
              registration.semester || legacyStudent?.semester || "",
          };
        })
      );
    } catch (error) {
      console.error("Fetch registrations error:", error);

      res.status(500).json({
        message: "Failed to fetch registrations.",
      });
    }
  }
);

app.get(
  "/api/events/:eventId/attendance",
  verifyToken,
  requireRole("faculty"),
  async (req, res) => {
    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const event = await Event.findById(req.params.eventId);
      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      if (String(event.facultyId) !== String(req.user.userId)) {
        return res.status(403).json({
          message: "You cannot view attendance for this event.",
        });
      }

      if (
        !event.attendanceEnabled ||
        !["compulsory", "both"].includes(event.attendanceType) ||
        !event.attendanceDepartment
      ) {
        return res.status(400).json({
          message: "This event does not have a required attendance cohort.",
        });
      }

      const departmentPattern = studentDepartmentPattern(
        event.attendanceDepartment
      );
      if (!departmentPattern) {
        return res.status(400).json({
          message: "This event has an unsupported attendance department.",
        });
      }

      const cohortStudents = await CollegeUser.find({
        role: "student",
        department: departmentPattern,
      })
        .select("name email studentId department semester")
        .lean();
      const cohortEmails = cohortStudents
        .map((student) => String(student.email || "").toLowerCase())
        .filter(Boolean);
      const cohortAccounts = cohortEmails.length
        ? await User.find({ email: { $in: cohortEmails } })
            .select("name email studentId")
            .lean()
        : [];
      const accountByEmail = new Map(
        cohortAccounts.map((account) => [
          String(account.email || "").toLowerCase(),
          account,
        ])
      );

      const registeredEmails = new Set();
      const registeredIds = new Set();
      const legacyAccountIds = [];

      event.registrations.forEach((registration) => {
        if (registration.studentEmail) {
          registeredEmails.add(
            String(registration.studentEmail).trim().toLowerCase()
          );
        }
        if (registration.studentId) {
          registeredIds.add(String(registration.studentId));
        }
        if (registration.userId) {
          registeredIds.add(String(registration.userId));
        } else if (
          !registration.studentEmail &&
          !registration.studentId &&
          validObjectId(registration._id)
        ) {
          legacyAccountIds.push(registration._id);
        }
      });

      if (legacyAccountIds.length) {
        const legacyAccounts = await User.find({
          _id: { $in: legacyAccountIds },
        })
          .select("email studentId")
          .lean();
        legacyAccounts.forEach((account) => {
          registeredIds.add(String(account._id));
          if (account.studentId) registeredIds.add(String(account.studentId));
          if (account.email) {
            registeredEmails.add(String(account.email).toLowerCase());
          }
        });
      }

      const students = cohortStudents.map((student) => {
        const email = String(student.email || "").toLowerCase();
        const account = accountByEmail.get(email);
        const identities = [
          student.studentId,
          account?.studentId,
          account?._id,
        ]
          .filter(Boolean)
          .map(String);

        return {
          studentId: student.studentId || account?.studentId || "",
          studentName: student.name || account?.name || "",
          studentEmail: student.email || "",
          department: student.department || "",
          semester: student.semester || "",
          registered:
            registeredEmails.has(email) ||
            identities.some((identity) => registeredIds.has(identity)),
        };
      });
      const registeredCount = students.filter(
        (student) => student.registered
      ).length;

      return res.status(200).json({
        department: event.attendanceDepartment,
        total: students.length,
        registered: registeredCount,
        unregistered: students.length - registeredCount,
        students,
      });
    } catch (error) {
      console.error("Fetch event attendance error:", error);
      return res.status(500).json({
        message: "Failed to fetch event attendance.",
      });
    }
  }
);

// =====================================
// REGISTER FOR EVENT
// POST /api/events/:eventId/register
// =====================================

app.post(
  "/api/events/:eventId/register",
  verifyToken,
  requireRole("student"),
  async (req, res) => {
    try {
      if (!validObjectId(req.params.eventId)) {
        return res.status(400).json({
          message: "Invalid event ID.",
        });
      }

      const student = await User.findById(req.user.userId);

      if (!student || student.role !== "student") {
        return res.status(404).json({
          message: "Student account not found.",
        });
      }

      const event = await Event.findById(req.params.eventId);
      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      const directoryStudent = await CollegeUser.findOne({
        email: student.email,
      }).select("studentId department semester");
      const studentDepartment =
        directoryStudent?.department || student.department || "";

      if (
        event.attendanceEnabled &&
        event.attendanceType === "compulsory" &&
        String(studentDepartment).trim().toLowerCase() !==
          String(event.attendanceDepartment).trim().toLowerCase()
      ) {
        return res.status(403).json({
          message: `This event is compulsory for students in ${event.attendanceDepartment}.`,
        });
      }

      const enrollmentId =
        student.studentId ||
        directoryStudent?.studentId ||
        String(student._id);
      const normalizedEmail = String(student.email).toLowerCase();
      const registrations = { $ifNull: ["$registrations", []] };
      const registrationIds = {
        $map: {
          input: registrations,
          as: "registration",
          in: {
            $convert: {
              input: {
                $ifNull: [
                  "$$registration.userId",
                  {
                    $cond: [
                      {
                        $ne: [
                          { $ifNull: ["$$registration.studentId", ""] },
                          "",
                        ],
                      },
                      "$$registration.studentId",
                      { $ifNull: ["$$registration._id", "$$registration"] },
                    ],
                  },
                ],
              },
              to: "string",
              onError: "",
              onNull: "",
            },
          },
        },
      };
      const registrationStudentIds = {
        $map: {
          input: registrations,
          as: "registration",
          in: {
            $convert: {
              input: "$$registration.studentId",
              to: "string",
              onError: "",
              onNull: "",
            },
          },
        },
      };
      const registrationEmails = {
        $map: {
          input: registrations,
          as: "registration",
          in: {
            $toLower: {
              $convert: {
                input: "$$registration.studentEmail",
                to: "string",
                onError: "",
                onNull: "",
              },
            },
          },
        },
      };
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: req.params.eventId,
          $expr: {
            $and: [
              {
                $lt: [
                  { $size: registrations },
                  { $ifNull: ["$capacity", 0] },
                ],
              },
              {
                $not: [
                  {
                    $in: [String(student._id), registrationIds],
                  },
                ],
              },
              {
                $not: [
                  {
                    $in: [String(enrollmentId), registrationStudentIds],
                  },
                ],
              },
              {
                $not: [
                  {
                    $in: [normalizedEmail, registrationEmails],
                  },
                ],
              },
            ],
          },
        },
        {
          $push: {
            registrations: {
              userId: student._id,
              studentId: enrollmentId,
              studentName: student.name || "",
              studentEmail: normalizedEmail,
              department: studentDepartment,
              semester:
                directoryStudent?.semester || student.semester || "",
              registeredAt: new Date(),
            },
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedEvent) {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
          return res.status(404).json({
            message: "Event not found.",
          });
        }

        const alreadyRegistered = event.registrations.some(
          (registration) =>
            String(registration.userId || "") === String(student._id) ||
            String(registration._id || "") === String(student._id) ||
            String(registration.studentEmail || "").toLowerCase() ===
              normalizedEmail ||
            String(registration.studentId || "") === String(enrollmentId)
        );

        return res.status(409).json({
          message: alreadyRegistered
            ? "You are already registered for this event."
            : "This event has reached its registration capacity.",
        });
      }

      res.status(201).json({
        message: "Registration successful",
        eventId: updatedEvent._id,
      });
    } catch (error) {
      console.error("Student registration error:", error);

      res.status(500).json({
        message: "Failed to register for event.",
      });
    }
  }
);

// =====================================
// GET STUDENT'S REGISTERED EVENTS
// GET /api/student/registrations
// =====================================

app.get(
  "/api/student/registrations",
  verifyToken,
  requireRole("student"),
  async (req, res) => {
    try {
      const userId = String(req.user.userId);
      const student = await User.findById(userId).select("email studentId");
      if (!student) {
        return res.status(404).json({
          message: "Student account not found.",
        });
      }
      const directoryStudent = await CollegeUser.findOne({
        email: student.email,
      }).select("studentId");
      const enrollmentId =
        student.studentId || directoryStudent?.studentId || userId;
      const normalizedEmail = String(student.email).toLowerCase();
      const events = await Event.find({
        $or: [
          {
            $expr: {
              $in: [
                userId,
                {
                  $map: {
                    input: { $ifNull: ["$registrations", []] },
                    as: "registration",
                    in: {
                      $convert: {
                        input: {
                          $ifNull: [
                            "$$registration.userId",
                            {
                              $cond: [
                                {
                                  $ne: [
                                    {
                                      $ifNull: [
                                        "$$registration.studentId",
                                        "",
                                      ],
                                    },
                                    "",
                                  ],
                                },
                                "$$registration.studentId",
                                {
                                  $ifNull: [
                                    "$$registration._id",
                                    "$$registration",
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        to: "string",
                        onError: "",
                        onNull: "",
                      },
                    },
                  },
                },
              ],
            },
          },
          { "registrations._id": userId },
          { "registrations.studentId": { $in: [userId, enrollmentId] } },
        ],
      }).sort({ date: 1 });
      const legacyEvents = await Event.find({
        "registrations.studentEmail": normalizedEmail,
      }).sort({ date: 1 });
      const matchingEvents = [
        ...new Map(
          [...events, ...legacyEvents].map((event) => [
            String(event._id),
            event,
          ])
        ).values(),
      ];

      res.json(
        matchingEvents.map((event) => {
          const result = event.toObject();
          result.registrationCount = result.registrations.length;
          result.seatsRemaining = Math.max(
            Number(result.capacity || 0) - result.registrationCount,
            0
          );
          result.registrations = result.registrations.filter(
            (registration) =>
              String(registration.userId || registration._id || "") === userId ||
              String(registration.studentId || "") === userId ||
              String(registration.studentId || "") === String(enrollmentId) ||
              String(registration.studentEmail || "").toLowerCase() ===
                normalizedEmail
          );
          return result;
        })
      );
    } catch (error) {
      console.error("Student registrations error:", error);

      res.status(500).json({
        message: "Failed to fetch student registrations.",
      });
    }
  }
);

// =====================================
// GET MY PROFILE
// GET /api/profile
// =====================================

app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to fetch profile.",
    });
  }
});

// =====================================
// UPDATE MY PROFILE
// PUT /api/profile
// =====================================

app.put("/api/profile", verifyToken, async (req, res) => {
  try {
    const { name, department } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          message: "Name cannot be empty.",
        });
      }

      updates.name = String(name).trim();
    }

    if (department !== undefined) {
      updates.department = String(department).trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No profile fields were provided to update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role === "faculty" && user.name) {
      await Event.updateMany(
        { organizer: user._id },
        { $set: { organizerName: user.name } }
      );
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile.",
    });
  }
});

// =====================================
// START SERVER AFTER MONGODB CONNECTS
// =====================================

async function startServer() {
  app.get("/api/personal-events/test", (req, res) => {
  res.json({ message: "Personal events route is reachable" });
});
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in backend/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();