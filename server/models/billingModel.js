const mongoose = require("mongoose");


const billingSchema = mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    clientNumber: {
        type: Number,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },
    discount: {
        type: Number
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
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
    },
    timeOfBilling: {
        type: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidDues: {
        type: Number,
        required: true
    },
    advancedGiven: {
        type: Number,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    giveRewardPoints: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: true
    },
    billStatus: {
        type: String,
        enum: ["PAID", "PENDING"]
    },
    paymentDetails: {
        type: Object
    },
    branchDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Branch"
    }
}, { timestamps: true })

const billModel = mongoose.model("Bill", billingSchema);

module.exports = billModel

//manual bill updates
//generate bill route ==>appointement se data adn baki jjo bhi required ho 
//get membership details and update membership details.

//seperate format for bills of products and services|??