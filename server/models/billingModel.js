const mongoose = require("mongoose");


const billingSchema = mongoose.Schema({
    billType: {
        type: String,
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,

        }
    }],
    toGiveIncentive: {
        type: Boolean
    },
    clientName: {
        type: String,
        required: true
    },
    clientNumber: {
        type: Number,
        required: true
    },
    discount: {
        type: Number
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
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
    branchDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    }
}, { timestamps: true })

const billModel = mongoose.model("Bill", billingSchema);

module.exports = billModel
//seperate format for bills of products and services|??