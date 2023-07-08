const appointmentDB = require("../models/appointmentModel");
const clientDB = require("../models/clientModel");
const staffDB = require("../models/staffModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require('express-async-handler');



const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Appointment routes established');
})
//create appointment
const createAppointment = asynchandler(async (req, res) => {
    const { clientName, clientNumber, timeOfAppointment, dateOfAppointment, serviceProvider, serviceFor, serviceSelected, durationOfAppointment, appointmentStatus, giveRewardPoints, subTotal, discount, totalAmount, paidDues, advancedGiven, branchDetails } = req.body;
    console.log(req.body);
    if (!clientName ||
        !clientNumber ||
        !timeOfAppointment ||
        !serviceProvider ||
        !serviceFor ||
        !serviceSelected ||
        !durationOfAppointment ||
        !appointmentStatus ||
        !branchDetails ||
        subTotal === undefined ||
        subTotal === null ||
        discount === undefined ||
        discount === null ||
        totalAmount === undefined ||
        totalAmount === null ||
        paidDues === undefined ||
        paidDues === null ||
        advancedGiven === undefined ||
        advancedGiven == null ||
        !dateOfAppointment) {
        return response.validationError(res, 'Please enter the required details');
    }
    const findClient = await clientDB.findOne({ clientNumber: clientNumber });
    if (!findClient) {
        return response.notFoundError(res, "Cannot find the client. Please register");
    }
    console.log("hehehehheheh111");
    const newAppointment = new appointmentDB({
        clientName,
        clientNumber,
        timeOfAppointment,
        serviceProvider,
        serviceFor,
        serviceSelected,
        durationOfAppointment,
        appointmentStatus,
        giveRewardPoints,
        subTotal,
        discount,
        totalAmount,
        paidDues,
        advancedGiven,
        dateOfAppointment,
        branchDetails
    })
    const savedAppointment = await newAppointment.save();
    console.log("hehehehheheh222");
    if (!savedAppointment) {
        return response.internalServerError(res, 'Failed to create the appointment');
    }
    console.log("hehehehheheh333");
    const updateStaff = await staffDB.findByIdAndUpdate({ _id: serviceProvider }, {
        $push: { appointments: savedAppointment._id }
    })
    if (!updateStaff) {
        return response.internalServerError(res, 'Created appointment but failed to update the staff')
    }
    console.log("hehehehheheh444");
    const newArray=[...findClient.appointmentDetails,savedAppointment._id];
    findClient.appointmentDetails=newArray;
    await findClient.save();
    console.log("hehehehheheh555");
    response.successResponse(res, savedAppointment, 'Successfully created the appointments')
})

//update appointment
const updateAppointment = asynchandler(async (req, res) => {
    const { appointmentId } = req.params;
    if (appointmentId == ":appointmentid") {
        return response.validationError(res, "Cannot find the appointment without its id");
    }
    const findAppointment = await appointmentDB.findById({ _id: appointmentId });
    if (!findAppointment) {
        return response.notFoundError(res, "cannot find the appointment");
    }
    const { timeOfAppointment, dateOfAppointment, serviceProvider, serviceFor, serviceSelected, durationOfAppointment, appointmentStatus, giveRewardPoints, subTotal, discount, totalAmount, paidDues, advancedGiven, branchDetails } = req.body;
    const updateData = {};
    if (timeOfAppointment) {
        updateData.timeOfAppointment = timeOfAppointment
    }
    if (serviceProvider) {
        updateData.serviceProvider = serviceProvider
    }
    if (serviceFor) {
        updateData.serviceFor = serviceFor
    }
    if (serviceSelected) {
        updateData.serviceSelected = serviceSelected
    }
    if (durationOfAppointment) {
        updateData.durationOfAppointment = durationOfAppointment
    }
    if (giveRewardPoints) {
        updateData.giveRewardPoints = giveRewardPoints
    }
    if (subTotal) {
        updateData.subTotal = subTotal
    }
    if (discount) {
        updateData.discount = discount
    }
    if (totalAmount) {
        updateData.totalAmount = totalAmount
    }
    if (paidDues) {
        updateData.paidDues = paidDues
    }
    if (advancedGiven) {
        updateData.advancedGiven = advancedGiven
    }
    if (dateOfAppointment) {
        updateData.dateOfAppointment = dateOfAppointment
    }
    const updatedAppointment = await appointmentDB.findByIdAndUpdate({ _id: appointmentId }, updateData, { new: true });
    if (updatedAppointment) {
        response.successResponse(res, updatedAppointment, 'Successfully updated the appointment');
    }
    else {
        response.internalServerError(res, 'Failed the update the appointment')
    }
})

//update status of appointment
const updateAppointmentStatus = asynchandler(async (req, res) => {
    const { appointmentId } = req.params;
    if (appointmentId == ":appointmentid") {
        return response.validationError(res, "Cannot find the appointment without its id");
    }
    const { status } = req.body;
    if (!status) {
        return response.validationError(res, 'Cannot update status without the status');
    }
    const findAppointment = await appointmentDB.findById({ _id: appointmentId }).populate("serviceProvider").populate("serviceSelected").populate("branchDetails");;
    if (!findAppointment) {
        return response.notFoundError(res, "cannot find the appointment");
    }
    findAppointment.appointmentStatus = status;
    await findAppointment.save();
    response.successResponse(res, findAppointment, 'Updated the status successfully');
})

//getallappointment
const getAllAppointment = asynchandler(async (req, res) => {
    const allData = await appointmentDB.find().populate("serviceProvider").populate("serviceSelected").populate("branchDetails");
    if (allData) {
        response.successResponse(res, allData, "Successfully fetched all the appointments");

    }
    else {
        response.internalServerError(res, 'Error in fetching all the appointments');
    }

})


//getaappointment

const getParticularAppointment = asynchandler(async (req, res) => {
    const { appointmentId } = req.params;
    if (!appointmentId) {
        return response.validationError(res, 'Cannot find an appointment without its id ');
    }
    const findAppointment = await appointmentDB.findById({ _id: appointmentId }).populate("branchDetails").populate("serviceProvider").populate("serviceSelected");
    if (findAppointment) {
        response.successResponse(res, findAppointment, 'Successfully found the appointment');
    }
    else {
        response.notFoundError(res, 'Cannot find the specified appointment')
    }

})

//getbranchwise appointment
const getBranchwiseAppointment = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (!branchId) {
        return response.validationError(res, 'Cannot find an appointment without its id ');
    }
    const findAppointment = await appointmentDB.find({ branchDetails: branchId }).populate("branchDetails").populate("serviceProvider").populate("serviceSelected");
    if (findAppointment) {
        response.successResponse(res, findAppointment, 'Successfully found the appointment');
    }
    else {
        response.notFoundError(res, 'Cannot find the specified appointment')
    }

})


//get staffwise appointment
const getStaffwiseAppointment = asynchandler(async (req, res) => {
    const { staffId } = req.params;
    if (!staffId) {
        return response.validationError(res, 'Cannot find an appointment without its id ');
    }
    const findAppointment = await appointmentDB.find({ serviceProvider: staffId }).populate("branchDetails").populate("serviceProvider").populate("serviceSelected");
    if (findAppointment) {
        response.successResponse(res, findAppointment, 'Successfully found the appointment');
    }
    else {
        response.notFoundError(res, 'Cannot find the specified appointment')
    }

})


//get userappointment by number
const userAppointments = asynchandler(async (req, res) => {
    const { clientNumber } = req.params;
    if (clientNumber == ":clientNumber") {
        return response.validationError(res, 'Cannot find the client appointment without its phonenumber');
    }
    const findClient = await clientDB.findOne({ clientNumber: clientNumber });
    if (!findClient) {
        return response.notFoundError(res, "Cannot find the client");
    }
    const findAllAppointments = await appointmentDB.find({ clientNumber: clientNumber }).populate("branchDetails").populate("serviceProvider").populate("serviceSelected");;
    if (!findAllAppointments) {
        return response.internalServerError(res, 'Cannot find the appointments');
    }
    response.successResponse(res, findAllAppointments, 'Successfully fetched the appointments');
})




module.exports = { test, createAppointment, updateAppointment, updateAppointmentStatus, getAllAppointment, getParticularAppointment, getBranchwiseAppointment, getStaffwiseAppointment, userAppointments };