const feedbackDB = require("../models/feedbackModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require("express-async-handler");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Feedback routes established');
})
const createFeedback = asynchandler(async (req, res) => {
    const { appointmentId, rating, description, branchDetails } = req.body;
    if (!appointmentId || !rating || !branchDetails) {
        response.validationError(res, 'Post atleast the rating to post a feedback');
        return;
    }
    const newFeedback = new feedbackDB({
        appointmentId,
        rating,
        description,
        branchDetails
    })
    const savedFeedback = await newFeedback.save();
    if (savedFeedback) {
        response.successResponse(res, savedFeedback, 'Successfully saved the feedback');
    }
    else {
        response.internalServerError(res, 'Cannot save the feedback');
    }


})

const getAllFeedbacks = asynchandler(async (req, res) => {

    const { branchDetails } = req.query;
    const queryObj = {};
    if (branchDetails) {
        queryObj.branchDetails = branchDetails;
    }
    const allData = await feedbackDB.find(queryObj).populate("appointmentId")
    if (allData) {
        response.successResponse(res, allData, "Successfully fetched all the data");

    }
    else {
        response.internalServerError(res, 'Error in fetching all the data');
    }

})


const getAFeedback = asynchandler(async (req, res) => {
    const { feedbackId } = req.params;
    // console.log(feedbackId)
    if (feedbackId == ':feedbackId') {
        response.validationError(res, 'Cannot get a data without its id');
        return;
    }
    const findResult = await feedbackDB.findById({ _id: feedbackId }).populate({
        path: 'appointmentId',
        populate: {
            path: 'serviceSelected serviceProvider branchDetails',

        }
    });
    if (findResult) {
        response.successResponse(res, findResult, "Fetched the feedback successfully")
    }
    else {
        response.notFoundError(res, 'Cannot find the specified feedback')
    }
})

module.exports = { test, createFeedback, getAllFeedbacks, getAFeedback };
