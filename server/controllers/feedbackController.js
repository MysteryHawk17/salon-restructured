const feedbackDB = require("../models/feedbackModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require("express-async-handler");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Feedback routes established');
})
const createFeedback = asynchandler(async (req, res) => {
    const { appointmentId, rating, description } = req.body;
    if (!appointmentId || !rating) {
        response.validationError(res, 'Post atleast the rating to post a feedback');
        return;
    }
    const newFeedback = new feedbackDB({
        appointmentId,
        rating,
        description
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
    const { page, limit } = req.query;
    if (!page && !limit) {

        const allData = await feedbackDB.find().populate("appointmentId")
        if (allData) {
            response.successResponse(res, allData, "Successfully fetched all the data");

        }
        else {
            response.internalServerError(res, 'Error in fetching all the data');
        }
    }
    else if (!page) {

        const limitedResults = await feedbackDB.find().limit(limit).populate("appointmentId")
        if (limitedResults) {
            response.successResponse(res, limitedResults, 'Successfully fetched the results');
        }
        else {
            response.internalServerError(res, 'Failed to fetch the responses');
        }
    }
    else if (page && limit) {

        const allData = await feedbackDB.find().populate({
            path: 'appointmentId',
            populate: {
                path: 'serviceSelected serviceProvider branchDetails',

            }
        })

        if (allData) {
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const result = allData.slice(startIndex, endIndex);
            const finalResult = {
                result: result,
                totalPage: Math.ceil(allData.length / limit)
            }
            response.successResponse(res, finalResult, 'Fetched the data succeessfully');
        }
        else {
            response.internalServerError(res, 'Unable to fetch the data');
        }
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
