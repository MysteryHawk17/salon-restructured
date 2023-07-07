const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);


module.exports = subscriptionModel;
