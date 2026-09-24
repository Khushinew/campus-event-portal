const eventSchema = new Mongoose.Schema({
title: {
    type: String,
    required: true
},

description: {
    type: String,
    required: true
},

eventType: {
    type: String,
    required: true
},

date: {
    type: String,
    required: true
},

startTime: {
    type: String,
    required: true
},

endTime: {
    type: String,
    required: true
},

venue: {
    type: String,
    required: true
},

host: {
    type: String,
    required: true
},

hostDesignation: {
    type: String,
    required: true
},

organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},

status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled"],
    default: "upcoming"
}
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;