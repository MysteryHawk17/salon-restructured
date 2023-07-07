const serviceDB = require("../models/servicesModel");
const branchDB = require("../models/branchModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require("express-async-handler");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', "Services routes established");
})

const createService = asynchandler(async (req, res) => {
    const { serviceName, category, duration, price, membershipPrice, rewardPoints, serviceFor, branchDetails, staffIncentive } = req.body;
    if (!serviceName || !category || !duration || !price || !membershipPrice || !rewardPoints || !serviceFor || !branchDetails || !staffIncentive) {
        response.validationError(res, 'Please enter all the fields');
    }
    const findBranch = await branchDB.findById({ _id: branchDetails });
    if (!findBranch) {
        return response.notFoundError(res, 'Cannot find the branch');
    }
    const newService = new serviceDB({
        serviceName: serviceName,
        category: category,
        duration: duration,
        price: price,
        membershipPrice: membershipPrice,
        rewardPoints: rewardPoints,
        serviceFor: serviceFor,
        branchDetails: branchDetails,
        staffIncentive: staffIncentive
    })
    findBranch.services.push(newService._id);
    await findBranch.save();
    const savedService = await newService.save();
    if (savedService) {
        response.successResponse(res, savedService, 'Successfully saved the services');
    }
    else {
        response.internalServerError(res, 'Error in saving the response');
    }

})

const getAllServicesByBranch = asynchandler(async (req, res) => {

    const { branchId } = req.params;
    if (!branchId || branchId == ":branchId") { return response.validationError(res, 'Cannot find the branch services without the branch id') }

    const findAllServices = await serviceDB.find({ branchDetails: branchId }).populate('branchDetails');
    if (findAllServices) {
        response.successResponse(res, findAllServices, 'Fetched services for the branch');
    }
    else {
        response.internalServerError(res, 'Cannot find the services');
    }
})

const getAService = asynchandler(async (req, res) => {
    const { serviceId } = req.params;
    if (!serviceId) {
        return response.validationError(res, 'Cannot find the service without its id');
    }
    const findService = await serviceDB.findById({ _id: serviceId }).populate("branchDetails");
    if (findService) {
        response.successResponse(res, findService, 'Successfully fetched the data');
    }
    else {
        response.notFoundError(res, 'Cannot fetch the service');
    }
})
const deleteService = asynchandler(async (req, res) => {
    const { serviceId } = req.params;
    if (!serviceId) {
        return response.validationError(res, 'Cannot find Service without its id');
    }
    const findService = await serviceDB.findById({ _id: serviceId }).populate("branchDetails");
    if (findService) {
        const deletedService = await serviceDB.findByIdAndDelete({ _id: serviceId });
        const findBranch = await branchDB.findByIdAndUpdate({ _id: findService.branchDetails._id }, {
            $pull: { services: deletedService._id }
        });
        if (deletedService) {
            response.successResponse(res, deletedService, 'Service was deleted successfully');
        }
        else {
            response.internalServerError(res, 'Error deleting the Service');
        }
    }

    else {
        response.notFoundError(res, 'Cannot found the specified service');
    }
})


const updateService = asynchandler(async (req, res) => {
    const { serviceId } = req.params;
    if (!serviceId) {
        return response.validationError(res, 'Cannot find Service without its id');
    }
    const findService = await serviceDB.findById({ _id: serviceId }).populate("branchDetails");
    if (findService) {
        const updateData = {};
        const { serviceName, category, duration, price, membershipPrice, rewardPoints, serviceFor, staffIncentive } = req.body;
        if (serviceName) {
            updateData.serviceName = serviceName;
        }
        if (category) {
            updateData.category = category;
        }
        if (duration) {
            updateData.duration = duration;
        }
        if (price) {
            updateData.price = price;
        }
        if (membershipPrice) {
            updateData.membershipPrice = membershipPrice;
        }
        if (rewardPoints) {
            updateData.rewardPoints = rewardPoints;
        }
        if (serviceFor) {
            updateData.serviceFor = serviceFor;
        }
        if (staffIncentive) {
            updateData.staffIncentive = staffIncentive;
        }
        const updatedService = await serviceDB.findByIdAndUpdate({ _id: serviceId }, updateData, { new: true });
        if (updatedService) {
            response.successResponse(res, updatedService, 'Successfully updated the service');
        }
        else {
            response.internalServerError(res, 'Failed to update the service');
        }

    }

    else {
        response.notFoundError(res, 'Cannot found the specified service');
    }
})


module.exports = { test, createService, updateService, deleteService, getAService, getAllServicesByBranch };