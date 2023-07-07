const mongoose = require("mongoose")

const branchSchema = mongoose.Schema({
    branchName: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner"
    },
    branchEmail: {
        type: String,
        required: true
    },
    branchPassword: {
        type: String,
        required: true
    },
    subscriptionDetails: {
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription"
        },
        startDate: {
            type: String,
            
        },
        endDate: {
            type: String,
            
        },
        paymentStatus:{
            type:String,
            default:"PENDING"
        }

    },
    activeStatus: {
        type: String,
        default:"PENDING"
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default:[]
    }],
    staffs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        default:[]
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default:[]
    }],
    parentBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },
    childrenBranch: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    }]
}, { timestamps: true });

const branchModel = mongoose.model("Branch", branchSchema);
module.exports = branchModel;