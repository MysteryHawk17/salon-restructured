const mongoose = require("mongoose");


const staffSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    phone: {
        type: Number,

    },
    mail: {
        type: String,
        required: true
    },
    workingHrs: {
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        }
    },
    salary: {
        type: Number,
        required: true
    },
    emergencyDetails: {
        contactNo: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
    },
    userName: {
        type: String,
        unique: true
    },
    password: {
        type: String,

    },
    gender: {
        type: String,
        required: true
    },
    dateOfJoining: {
        type: String
    },
    userType: {
        type: String,
    },
    department: {
        type: String,
        required: true
    },
    displayImg: {
        type: String,

    },
    idProof: {
        type: String,

    },
    branchDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },
    incentive: {
        type: Number,
        required: true,
        default: 0
    },
    target: {
        type: Number,
        default: 0
    },
    allowIncentive: {
        type: Boolean,
        default: false
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    }],
    attendance: {
        type: [String],
        default: []
    }
}, { timestamps: true })

const staffModel = mongoose.model("Staff", staffSchema);
module.exports = staffModel;


