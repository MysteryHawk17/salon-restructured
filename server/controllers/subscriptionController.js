const subscriptionDB = require("../models/subscriptionModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require('express-async-handler');

const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Subscription routes established');
})

//create subscription
const createSubscription = asynchandler(async (req, res) => {
    const { name, duration, price } = req.body;
    if (!name || !duration || !price) {
        return response.validationError(res, "cannot create a subscription without details")
    }
    const newSubscription = new subscriptionDB({
        name: name,
        duration: duration,
        price: price
    })
    const savedSubscription = await newSubscription.save();
    if (savedSubscription) {
        response.successResponse(res, savedSubscription, "Saved the subscription successfully");
    }
    else {
        response.internalServerError(res, 'Failed to save the subscription');
    }
})

//getallsubscription
const getAllSubscription = asynchandler(async (req, res) => {
    const allSubscription = await subscriptionDB.find();
    if (allSubscription) {
        response.successResponse(res, allSubscription, "Successfully fetched all the subscription");
    }
    else {
        response.internalServerError(res, 'Failed to fetch all the subscription');
    }
})
//get a subscription

const getAsubscription = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, 'Cannot get a subscription without its id');

    }
    const getsubscription = await subscriptionDB.findById({ _id: id })
    if (getsubscription) {
        response.successResponse(res, getsubscription, "Fetched the subscription");
    }
    else {
        response.internalServerError(res, "Failed to fetch the subscription");
    }
})
//delete subscrition
const deleteSubscription = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot delete the subscription without its id");
    }
    const findSubscription = await subscriptionDB.findById({ _id: id });
    if (findSubscription) {
        const deletedSubscription = await subscriptionDB.findByIdAndDelete({ _id: id });
        if (deletedSubscription) {
            response.successResponse(res, deletedSubscription, 'Successfully deleted the subscription');
        }
        else {
            response.internalServerError(res, 'Failed to delete the subscription');
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the specified subscription');
    }
})

module.exports = { test, createSubscription,getAsubscription, getAllSubscription, deleteSubscription }