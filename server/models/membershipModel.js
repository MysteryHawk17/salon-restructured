const mongoose = require("mongoose");


const membershipSchmea = mongoose.Schema({
    membershipName: {
        type: String,
        required: true
    },
    membershipPrice: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    servicesOffered: [
        {
            service: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service"
            },
            availableCount: {
                type: Number
            }
        }
    ],
    conditionForMembership: {
        type: String,
        required: true
    }
},{timestamps:true})

const memberShipModel=mongoose.model("Membership",membershipSchmea);

module.exports=memberShipModel;

