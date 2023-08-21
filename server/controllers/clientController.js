const clientDB = require("../models/clientModel");
const membershipDB = require('../models/membershipModel');
const response = require("../middlewares/responseMiddleware");
const asynchandler = require('express-async-handler');

const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Client routes established');

})

//create client
const createClient = asynchandler(async (req, res) => {
    //SOURCE
    const { clientName, clientNumber, clientEmail, clientAddress, gender } = req.body;
    if (!clientName || !clientNumber || !clientEmail || !clientAddress || !gender) {
        return response.validationError(res, 'Cannot create a client without proper information');
    }
    const findClient = await clientDB.findOne({ clientNumber: clientNumber });
    if (findClient) {
        return response.errorResponse(res, "Client already exists", 400);

    }
    const newClient = new clientDB({
        clientName: clientName,
        clientEmail: clientEmail,
        clientNumber: clientNumber,
        clientAddress: clientAddress,
        gender: gender
    })
    const savedClient = await newClient.save();
    if (!savedClient) {
        return response.internalServerError(res, "Cannot create the client");
    }
    response.successResponse(res, savedClient, 'Created client successfully');
})


//getallclient
const getAllClients = asynchandler(async (req, res) => {
    const allClients = await clientDB.find()
    if (allClients) {
        response.successResponse(res, allClients, "Successfully fetched all the clients");
    }
    else {
        response.internalServerError(res, "Cannot fetch all the clients");
    }
})

//get cliet
const getClient = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot find a client without its id");
    }
    const findClient = await clientDB.findById({ _id: id })
    if (findClient) {
        response.successResponse(res, findClient, 'Successfully found the client');
    }
    else {
        response.internalServerError(res, 'Cannot find the cliennt');
    }
})

//find client by number

const getClientByNumber = asynchandler(async (req, res) => {
    const { clientNumber } = req.params;
    if (clientNumber == ":clientNumber")
        return response.validationError(res, 'Cannot find client without its number');

    const findClient = await clientDB.findOne({ clientNumber: clientNumber }).populate("appointmentDetails")
    if (findClient) {
        response.successResponse(res, findClient, "Successfully found the client");
    }
    else {
        response.internalServerError(res, 'Cannot find the client');
    }
})

//update client
const updateClient = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot find a client without its id");
    }
    const findClient = await clientDB.findById({ _id: id });
    if (findClient) {
        const { clientName, clientNumber, clientEmail, clientAddress, gender } = req.body;
        const updateData = {};
        if (clientName) {
            updateData.clientName = clientName;
        }
        if (clientNumber) {
            updateData.clientNumber = clientNumber;
        }
        if (clientEmail) {
            updateData.clientEmail = clientEmail;
        }
        if (clientAddress) {
            updateData.clientAddress = clientAddress;
        }
        if (gender) {
            updateData.gender = gender;
        }
        const updatedClient = await clientDB.findByIdAndUpdate({ _id: id }, updateData, { new: true });
        if (!updatedClient) {
            return response.internalServerError(res, 'Failed to update client');
        }


        response.successResponse(res, updatedClient, 'Successfully updated the client');
    }
    else {
        response.internalServerError(res, 'Cannot find the cliennt');
    }
})


//delete client

const deleteClient = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot find a client without its id");
    }
    const findClient = await clientDB.findById({ _id: id });
    if (findClient) {
        const deletedClient = await clientDB.findByIdAndDelete({ _id: id });
        response.successResponse(res, deletedClient, 'Successfully updated the client');
    }
    else {
        response.internalServerError(res, 'Cannot find the cliennt');
    }
})

//buy membership

const buyMembership = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, 'Cannot buy membership without client id');
    }
    const findMember = await clientDB.findById({ _id: id });
    if (!findMember) {
        return response.validationError(res, 'Cannot find the member');
    }
    const { membershipId, duration } = req.body;
    if (!membershipId || !duration) {
        return response.validationError(res, 'Membership details required for buying membership');
    }
    const startDate = new Date();
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + parseInt(duration), startDate.getDate());
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    const membershipDetail = await membershipDB.findById({ _id: membershipId }).populate({
        path: "servicesOffered.service",
        select: "serviceName category duration price serviceFor"
    });
    // console.log(membershipDetail.servicesOffered);
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const arr = [];
    membershipDetail.servicesOffered.map((e) => {
        const obj = {};
        obj.id = e.service._id
        obj.serviceName = e.service.serviceName,
            obj.category = e.service.category,
            obj.duration = e.service.duration;
        obj.price = e.service.price;
        obj.serviceFor = e.service.serviceFor,
            obj.count = e.availableCount

        arr.push(obj)
    })
    console.log(arr);
    const membershipDetails = {
        services: arr,
        startDate: formattedStartDate,
        endDate: formattedEndDate
    }
    findMember.membershipDetails = membershipDetails;
    await findMember.save();
    response.successResponse(res, findMember, 'Successfully bought the membership');

})

//check membership
const checkMembership = asynchandler(async (req, res) => {
    const { clientNumber } = req.params;
    if (clientNumber == ":clientNumber" || clientNumber == undefined) {
        return response.validationError(res, 'Cannot find a client without its number');
    }
    const findClient = await clientDB.findOne({ clientNumber: clientNumber })
    if (!findClient) {
        return response.notFoundError(res, 'Cannot find the client');
    }
    const startDate = new Date();
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    const formattedStartDate = formatDate(startDate);
    const endIso = new Date(findClient.membershipDetails.endDate).toISOString();
    const todayIso = new Date(formattedStartDate).toISOString();
    if (todayIso > endIso) {
        findClient.membershipDetails = {};
    }
    await findClient.save();
    response.successResponse(res, findClient.membershipDetails, 'Successfully fetched the client membership details');
})

//update membership


const updateMembership = asynchandler(async (req, res) => {
    const { clientNumber } = req.params;
    if (clientNumber == ":clientNumber" || clientNumber == undefined) {
        return response.validationError(res, 'Cannot find a client without its number');
    }
    const findClient = await clientDB.findOne({ clientNumber: clientNumber })
    if (!findClient) {
        return response.notFoundError(res, 'Cannot find the client');
    }
    const { service } = req.body;
    if (!service) {
        return response.validationError(res, 'Cannot update without the service name');
    }
    // const membershipDetails = findClient.membershipDetails;
    const findIndex = findClient.membershipDetails.services.findIndex(obj => obj.serviceName == service);
    if (findClient.membershipDetails.services[findIndex].count == 0) {
        return response.errorResponse(res, 'Cannot avail service without its availiblity', 400);
    }
    const pcount = findClient.membershipDetails.services[findIndex].count;
    console.log(pcount)
    findClient.membershipDetails.services[findIndex].count = pcount - 1;
    console.log(findClient.membershipDetails.services[findIndex].count)
    await findClient.save();
    response.successResponse(res, findClient, 'Availed service successfully');
})




module.exports = { test, createClient, getAllClients, getClient, getClientByNumber, updateClient, deleteClient, buyMembership, checkMembership, updateMembership };