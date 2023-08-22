const mongoose = require("mongoose");



const clientSchema = mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    clientNumber: {
        type: String,
        required: true
    },
    clientEmail: {
        type: String,

    },
    clientAddress: {
        type: Object,

    },
    appointmentDetails: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    }],
    gender: {
        type: String,
        required: true
    },
    membershipDetails: {
        services: [Object],
        startDate: {
            type: String,
        },
        endDate: {
            type: String
        }
    },
    rewardPointsEarned: {
        type: Number,
        default: 0
    }
}, { timestamps: true })


const clientModel = mongoose.model("Client", clientSchema);

module.exports = clientModel;