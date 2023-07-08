const membershipDB = require('../models/membershipModel');
const response = require("../middlewares/responseMiddleware");
const asynchandler = require('express-async-handler');
const { default: mongoose } = require('mongoose');

const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Membership routes established');

})

const createMembership = asynchandler(async (req, res) => {
    const { membershipName, membershipPrice, duration, conditionForMembership } = req.body;
    if (!membershipName || !membershipPrice || !duration || !conditionForMembership) {
        return response.validationError(res, 'Cannot create membership without proper information');
    }
    const newMembership = new membershipDB({
        membershipName: membershipName,
        membershipPrice: membershipPrice,
        duration: duration,
        conditionForMembership: conditionForMembership
    })
    const savedMembership = await newMembership.save();
    if (savedMembership) {
        response.successResponse(res, savedMembership, 'Successfully created the membership')
    }
    else {
        response.internalServerError(res, 'Error in creating membership');
    }
})

const addService = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == undefined || id == ":id") {
        return response.validationError(res, 'Cannot add service without the membershipid')
    }
    const { serviceId, serviceCount } = req.body;
    if (!serviceId || !serviceCount) {
        return response.validationError(res, 'Cannoot add service without the details')
    }
    const serviceDetail = {
        service: serviceId,
        availableCount: serviceCount
    }
    const findMembership = await membershipDB.findById({ _id: id });
    if (!findMembership) {
        return response.validationError(res, 'Cannot find the membership ')
    }
    const updatedMembership = await membershipDB.findByIdAndUpdate({ _id: id }, {
        $push: { servicesOffered: serviceDetail }
    }, { new: true });
    if (!updatedMembership) {
        return response.internalServerError(res, 'Cannot update the services');
    }

    response.successResponse(res, updatedMembership, "Successfully added the service");
})
//delete service
const deleteService = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == undefined || id == ":id") {
        return response.validationError(res, 'Cannot add service without the membershipid')
    }
    const { serviceId } = req.body;
    if (!serviceId) {
        return response.validationError(res, 'Cannoot add service without the details')
    }

    const findMembership = await membershipDB.findById({ _id: id });
    if (!findMembership) {
        return response.validationError(res, 'Cannot find the membership ')
    }
    const data=new mongoose.Types.ObjectId(serviceId)
    console.log(data)
    const filteredArray = findMembership.servicesOffered.filter((e) => {
        return e.service == data;
    })
    console.log(filteredArray)
    findMembership.servicesOffered = filteredArray;
    await findMembership.save();
    response.successResponse(res, findMembership, "Successfully deleted the membership");
})

//getallmembership

const getAllMembership = asynchandler(async (req, res) => {
    const allMembership = await membershipDB.find({}).populate({
        path: "servicesOffered.service"
    })
    if (allMembership) {
        response.successResponse(res, allMembership, 'Successfully found all the membership');
    }
    else {
        response.internalServerError(res, 'Cannot find all the membership');
    }
})

//getamembership
const getAMembership = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, 'Cannot find the membership without its id');
    }
    const findMembership = await membershipDB.findById({ _id: id }).populate({
        path: "servicesOffered.service"
    });
    if (findMembership) {
        response.successResponse(res, findMembership, 'Successfully found the mmebership');
    }
    else {
        response.notFoundError(res, "Cannot find the membership");
    }
})


//edit membership details
const updateMembershipDetails = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, 'Cannot find the membership without its id');
    }
    const findMembership = await membershipDB.findById({ _id: id });
    if (findMembership) {
        const updateData = {};
        const { membershipName, membershipPrice, duration, conditionForMembership } = req.body;
        if (membershipName) {
            updateData.membershipName = membershipName;
        }
        if (membershipPrice) {
            updateData.membershipPrice = membershipPrice;
        }
        if (duration) {
            updateData.duration = duration;
        }
        if (conditionForMembership) {
            updateData.conditionForMembership = conditionForMembership;
        }
        const updatedMembership = await membershipDB.findByIdAndUpdate({ _id: id }, updateData, {
            new: true
        });
        if (updatedMembership) {

            response.successResponse(res, updatedMembership, 'Successfully updated the membership')
        }
        else {
            response.internalServerError(res, 'Cannot update the membership');
        }
    }
    else {
        response.notFoundError(res, "Cannot find the membership");
    }
})


//delete membership
const deleteMembership = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, 'Cannot find the membership without its id');
    }
    const findMembership = await membershipDB.findById({ _id: id });
    if (findMembership) {
        const deletedMembership = await membershipDB.findByIdAndDelete({ _id: id });
        if (deletedMembership) {

            response.successResponse(res, deletedMembership, 'Successfully updated the membership')
        }
        else {
            response.internalServerError(res, 'Cannot update the membership');
        }
    }
    else {
        response.notFoundError(res, "Cannot find the membership");
    }
})

module.exports = { test, createMembership, getAllMembership, getAMembership, updateMembershipDetails, deleteMembership, addService, deleteService };