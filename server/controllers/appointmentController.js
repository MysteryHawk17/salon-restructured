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
    const { clientName, clientNumber, gender, timeOfAppointment, dateOfAppointment, serviceSelected, sourceOfAppointment, branchDetails } = req.body;
    console.log(req.body);
    var temp = 0;
    var savedClient;
    if (!clientName || !clientNumber || !timeOfAppointment || !dateOfAppointment || !serviceSelected || !sourceOfAppointment || !branchDetails) {
        return response.validationError(res, 'Please enter the required details');
    }
    const findClient = await clientDB.findOne({ clientNumber: clientNumber });
    if (!findClient) {
        temp = 1;
        const newClient = new clientDB({
            clientName: clientName,
            clientEmail: clientEmail,
            clientNumber: clientNumber,
            clientAddress: clientAddress,
            gender: gender
        })
        savedClient = await newClient.save();
        if (!savedClient) {
            return response.internalServerError(res, "Cannot create the client");
        }
    }
    const createdAppointment = [];
    try {
        for (const e of serviceSelected) {
            const newAppointment = new appointmentDB({
                clientName,
                clientNumber,
                timeOfAppointment,
                dateOfAppointment,
                serviceSelected: e,
                sourceOfAppointment,
                branchDetails,
                gender
            });

            const savedAppointment = await newAppointment.save();

            if (!savedAppointment) {
                return response.internalServerError(res, 'Failed to create the appointment');
            }

            const findAppointment = await appointmentDB.findById(savedAppointment._id).populate("branchDetails").populate("serviceProvider").populate("serviceSelected");
            if (temp == 1) {
                savedClient.appointmentDetails.push(savedAppointment._id);
                await savedClient.save();
            }
            else {
                findClient.appointmentDetails.push(savedAppointment._id);
                await findClient.save();
            }

            createdAppointment.push(findAppointment);
        }
        response.successResponse(res, createdAppointment, 'Successfully created the appointments')
    } catch (error) {
        console.log(error);
        response.internalServerError(res, "Error occured");
    }
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
    const { timeOfAppointment, dateOfAppointment, serviceSelected, } = req.body;
    const updateData = {};
    if (timeOfAppointment) {
        updateData.timeOfAppointment = timeOfAppointment
    }
    if (serviceSelected) {
        updateData.serviceSelected = serviceSelected
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
    if (status === "COMPLETE") {
        const findStaff = await staffDB.findById({ _id: findAppointment.serviceProvider._id });
        if (!findStaff) {
            return response.internalServerError(res, "Cannot findStaff");
        }
        findStaff.incentive = findStaff.incentive + findAppointment.serviceSelected.price;
        if (findStaff.incentive >= findStaff.target) {
            findStaff.allowIncentive = true;
        }
        await findStaff.save();
    }
    await findAppointment.save();
    response.successResponse(res, findAppointment, 'Updated the status successfully');
})

//getallappointment
const getAllAppointment = asynchandler(async (req, res) => {
    //add query for completed appointment
    const { status, isAssigned } = req.query;
    const queryObj = {};
    if (status) {
        queryObj.appointmentStatus = status;
    }
    if (isAssigned == false || isAssigned == true) {
        queryObj.isAssigned = isAssigned;
    }
    const allData = await appointmentDB.find(queryObj).populate("serviceProvider").populate("serviceSelected").populate("branchDetails");
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


const userAppointmentsDatewise = asynchandler(async (req, res) => {
    const { clientNumber, date } = req.query;

    const data = await appointmentDB.aggregate([
        {
            $match: {
                dateOfAppointment: date,
                clientNumber: clientNumber,
                appointmentStatus: "COMPLETE"
            }
        },
        {
            $lookup: {
                from: "services",
                localField: "serviceSelected",
                foreignField: "_id",
                as: "selectedServices"
            }
        },
        {
            $group: {
                _id: {
                    // date: "$dateOfAppointment",
                    phone: "$clientNumber",
                    clientName: "$clientName",
                    date: "$dateOfAppointment",
                    // timeOfAppointment: "$timeOfAppointment",
                },
                // appointments: {
                //     $push: {
                //     //   date: "$dateOfAppointment",
                //     //   timeOfAppointment: "$timeOfAppointment",
                //       selectedServices: "$selectedServices"
                //       }
                //   },
                // selectedServices: "$selectedServices"


                selectedServices: {
                    $push: "$selectedServices"
                }
            }
        }
    ]);
    console.log(data);
    if (!data) {
        return response.internalServerError(res, 'Error in finding the data');
    }
    response.successResponse(res, data, 'Fetched the data successfully');


})
module.exports = { test, createAppointment, updateAppointment, updateAppointmentStatus, getAllAppointment, getParticularAppointment, getBranchwiseAppointment, getStaffwiseAppointment, userAppointments, userAppointmentsDatewise };