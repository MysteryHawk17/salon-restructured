const mongoose = require("mongoose");


const ownerSchema = mongoose.Schema({
    name: {
        type: String,
        requied: true
    },
    email: {
        type: String,
        requied: true
    },
    password: {
        type: String,
        requied: true
    },
    phone: {
        type: String,
        requied: true
    },
    branch: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    }]

}, { timestamps: true });

const salonOwnerModel = mongoose.model("Owner", ownerSchema);

module.exports = salonOwnerModel;