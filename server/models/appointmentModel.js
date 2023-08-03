const mongoose = require("mongoose");



const appointmentSchema = mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    clientNumber: {
        type: Number,
        required: true
    },
    timeOfAppointment: {
        type: String,
        required: true
    },
    dateOfAppointment: {
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
    serviceFor: {
        type: String,
    },
    serviceSelected: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    },
    durationOfAppointment: {
        type: Object,
    },
    appointmentStatus: {
        type: String,
        required: true,
        default: "RESERVED"
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    paidDues: {
        type: Number,
        required: true,
        default: 0
    },
    advancedGiven: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },
    giveRewardPoints: {
        type: Boolean,
        default: false
    },
    branchDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    }
}, { timestamps: true });


const appointmentModel = mongoose.model("Appointment", appointmentSchema);


module.exports = appointmentModel;



