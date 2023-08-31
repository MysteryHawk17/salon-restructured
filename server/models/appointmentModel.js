const mongoose = require("mongoose");



const appointmentSchema = mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    clientNumber: {
        type: String,
        required: true
    },
    dateOfAppointment: {
        type: String,
    },
    serviceSelected: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    },
    timeOfAppointment: {
        type: String,
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    isAssigned: {
        type: Boolean,
        default: false
    },
    appointmentStatus: {
        type: String,
        required: true,
        default: "RESERVED"
    },
    branchDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },
    sourceOfAppointment: {
        type: String,
        required: true
    },
    gender:{
        type:String
    }
}, { timestamps: true });


const appointmentModel = mongoose.model("Appointment", appointmentSchema);


module.exports = appointmentModel;