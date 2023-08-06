const serviceDB = require("../models/servicesModel");
const branchDB = require("../models/branchModel");
const categoryDB = require("../models/serviceCategoryModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require("express-async-handler");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', "Services routes established");
})

const createCategory = asynchandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return response.validationError(res, "Cannot create a category without its name");
    }
    const newCategory = await categoryDB.create({
        name: name
    });
    if (!newCategory) {
        return response.internalServerError(res, "Failed to create category");
    }
    response.successResponse(res, newCategory, 'Created the category successfully');
})
const getAllCategory = asynchandler(async (req, res) => {
    const allCategory = await categoryDB.find();
    if (!allCategory) {
        return response.internalServerError(res, 'Failed to fetch the categoryies');
    }
    response.successResponse(res, allCategory, 'Fetched the categories successfully');
})
const getACategory = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot find the category without its id");
    }
    const findCategory = await categoryDB.findById({ _id: id });
    if (!findCategory) {
        return response.validationError(res, "Failed to find the category successfully");
    }
    response.successResponse(res, findCategory, 'Successfully find the category');
})
const updateCategory = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot find the category without its id");
    }
    const findCategory = await categoryDB.findById({ _id: id });
    if (!findCategory) {
        return response.validationError(res, "Failed to find the category successfully");
    }
    const { name } = req.body;
    if (name) {

        findCategory.name = name;
    }
    const savedCategory = await findCategory.save();
    if (!savedCategory) {
        return response.internalServerError(res, 'Cannot update category');
    }
    response.successResponse(res, savedCategory, "Updated the category");
})

const deleteCategory = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot find the category without its id");
    }
    const findCategory = await categoryDB.findById({ _id: id });
    if (!findCategory) {
        return response.validationError(res, "Failed to find the category successfully");
    }
    const deletedCategory = await categoryDB.findByIdAndDelete({ _id: id });
    if (!deletedCategory) {
        return response.validationError(res, "Cannot delete the category");
    }
    response.successResponse(res, deletedCategory, 'Deleted the category successfully');
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
        const findService = await serviceDB.findById({ _id: savedService._id }).populate("category").populate("branchDetails");;
        if (!findService) {
            return response.internalServerError(res, 'Failed to saved the service');
        }

        response.successResponse(res, findService, 'Successfully saved the services');
    }
    else {
        response.internalServerError(res, 'Error in saving the response');
    }

})

const getAllServicesByBranch = asynchandler(async (req, res) => {

    const { branchId } = req.params;
    if (!branchId || branchId == ":branchId") { return response.validationError(res, 'Cannot find the branch services without the branch id') }

    const findAllServices = await serviceDB.find({ branchDetails: branchId }).populate('branchDetails').populate("category")
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
    const findService = await serviceDB.findById({ _id: serviceId }).populate("branchDetails").populate("category");
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
    const findService = await serviceDB.findById({ _id: serviceId }).populate("branchDetails").populate("category");
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
    const findService = await serviceDB.findById({ _id: serviceId }).populate("branchDetails").populate("category");
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
            const findService = await serviceDB.findById({ _id: savedService._id }).populate("category").populate("branchDetails");
            if (!findService) {
                response.successResponse(res, updatedService, 'Successfully updated the service');
            }

            response.successResponse(res, findService, 'Successfully updated the services');

        }
        else {
            response.internalServerError(res, 'Failed to update the service');
        }

    }

    else {
        response.notFoundError(res, 'Cannot found the specified service');
    }
})


module.exports = { test, createService, updateService, deleteService, getAService, getAllServicesByBranch, createCategory, getAllCategory, getACategory, deleteCategory, updateCategory };