const billingDB = require("../models/billingModel.js")
const clientDB = require("../models/clientModel.js");
const staffDB = require("../models/staffModel")
const serviceDB = require("../models/servicesModel.js")
const asynchandler = require("express-async-handler");
const response = require("../middlewares/responseMiddleware");
const { default: mongoose } = require("mongoose");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Billing routes established');
})

const createBill = asynchandler(async (req, res) => {
    const { clientName, clientNumber, timeOfBilling, price, billStatus, paymentDetails, serviceProvider, serviceFor, serviceSelected, durationOfAppointment, appointmentStatus, giveRewardPoints, subTotal, discount, totalAmount, paidDues, advancedGiven, branchDetails } = req.body;

    if (!clientName || !clientNumber || !timeOfBilling || !price || !billStatus || !serviceProvider || !serviceFor || !serviceSelected || !durationOfAppointment || !appointmentStatus || !giveRewardPoints || subTotal === undefined || subTotal === null || discount === undefined || discount === null || totalAmount === undefined || totalAmount === null || paidDues === undefined || paidDues === null || advancedGiven === undefined || advancedGiven == null || !branchDetails) {
        response.validationError(res, 'Fill in all the details');
        return;
    }
    const findClient = await clientDB.findOne({ clientNumber: clientNumber });

    if (findClient) {

        const newBill = new billingDB({
            clientName,
            clientNumber,
            timeOfBilling,
            price,
            billStatus,
            paymentDetails,
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
            branchDetails
        })
        const savedBill = await newBill.save();
        const findService = await serviceDB.findById({ _id: serviceSelected });
        const findStaff = await staffDB.findById({ _id: serviceProvider });
        if (savedBill) {
            if (billStatus == "PAID") {
                if (giveRewardPoints) {
                    findClient.rewardPointsEarned = findClient.rewardPointsEarned + findService.rewardPoints;
                    await findClient.save();
                }
                findStaff.incentive = findService.staffIncentive + findStaff.incentive;
                await findStaff.save();
            }

            response.successResponse(res, savedBill, 'Saved bill successfully');
        }
        else {
            response.internalServerError(res, "Failed to generate the bill");
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the client');
    }

})
const getAllBills = asynchandler(async (req, res) => {


    const allData = await billingDB.find().populate("serviceProvider").populate("serviceSelected").populate("branchDetails");
    if (allData) {
        response.successResponse(res, allData, "Successfully fetched all the bills");

    }
    else {
        response.internalServerError(res, 'Error in fetching all the bills');
    }
})

const getAClientBill = asynchandler(async (req, res) => {
    const { clientNumber } = req.params;
    if (!clientNumber) {
        response.validationError(res, 'Cannot get a clients bill without the number');
        return;
    }
    const findAllBills = await billingDB.find({ clientNumber: clientNumber }).populate("serviceProvider").populate("serviceSelected").populate('branchDetails');
    if (findAllBills) {
        response.successResponse(res, findAllBills, 'Successfully fetched all the bills');
    }
    else {
        response.internalServerError(res, 'Failed to fetch the bills');
    }
})

const getTotalSalesAmount = asynchandler(async (req, res) => {


    const result = await billingDB.aggregate([
        {
            $match: { billStatus: 'PAID' }
        },
        {
            $group: {
                _id: null,
                totalPaidAmounts: { $sum: '$totalAmount' }
            }
        }
    ]);
    if (result) {
        if (result.length > 0) {
            const totalPaidAmounts = result[0].totalPaidAmounts;
            console.log('Total Paid Amounts:', totalPaidAmounts);
            response.successResponse(res, totalPaidAmounts, 'Successfully fetched the total sales');
        } else {
            console.log('No paid bills found.');
            response.successResponse(res, 0, 'Successfully fetched the paid amounts');
        }
    }
    else {
        response.internalServerError(res, 'Cannot fetch the required data');
    }

})

const getTotalSalesAmountByBranch = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ":branchId") {
        return response.validationError(res, 'Cannot find the data of the branch without its id');
    }
    const checkId=new mongoose.Types.ObjectId(branchId)
    const result = await billingDB.aggregate([
        {
            $match: { billStatus: 'PAID', branchDetails: checkId }
        },
        {
            $group: {
                _id: branchId,
                totalPaidAmounts: { $sum: '$totalAmount' }
            }
        }
    ]);
    console.log(result);
    if (result) {
        if (result.length > 0) {
            const totalPaidAmounts = result[0].totalPaidAmounts;
            console.log('Total Paid Amounts:', totalPaidAmounts);
            response.successResponse(res, totalPaidAmounts, 'Successfully fetched the total sales');
        } else {
            console.log('No paid bills found.');
            response.successResponse(res, 0, 'Successfully fetched the paid amounts');
        }
    }
    else {
        response.internalServerError(res, 'Cannot fetch the required data');
    }

})

const updateBillDetails = asynchandler(async (req, res) => {
    const { quantity, timeOfBilling, price, serviceProvider, serviceFor, serviceSelected, durationOfAppointment, appointmentStatus, giveRewardPoints, subtotal, discount, totalAmount, paidDues, advancedGiven } = req.body;
    const { billId } = req.params;
    if (!billId) {
        return response.validationError(res, 'Please enter all the fields');
    }
    const findBill = await billingDB.findById({ _id: billId });
    if (findBill) {
        const updateData = {};
        if (quantity) {
            updateData.quantity = quantity;
        }
        if (timeOfBilling) {
            updateData.timeOfBilling = timeOfBilling;
        }
        if (price) {
            updateData.price = price;
        }
        if (serviceProvider) {
            updateData.serviceProvider = serviceProvider;
        }
        if (serviceFor) {
            updateData.serviceFor = serviceFor;
        }
        if (serviceSelected) {
            updateData.serviceSelected = serviceSelected;
        }
        if (durationOfAppointment) {
            updateData.durationOfAppointment = durationOfAppointment;
        }
        if (appointmentStatus) {
            updateData.appointmentStatus = appointmentStatus;
        }
        if (giveRewardPoints) {
            updateData.giveRewardPoints = giveRewardPoints;
        }
        if (subtotal) {
            updateData.subtotal = subtotal;
        }
        if (discount) {
            updateData.discount = discount;
        }
        if (totalAmount) {
            updateData.totalAmount = totalAmount;
        }
        if (paidDues) {
            updateData.paidDues = paidDues;
        }
        if (advancedGiven) {
            updateData.advancedGiven = advancedGiven;
        }
        const updatedBill = await billingDB.findByIdAndUpdate({ _id: billId }, updateData, { new: true });
        if (updatedBill) {
            response.successResponse(res, updatedBill, 'Successfully update the bills')
        }
        else {
            response.internalServerError(res, 'Failed to update the bill');
        }

    }
    else {
        response.notFoundError(res, 'Cannot find the bills')
    }


})


const updateBillStatus = asynchandler(async (req, res) => {
    const { paymentDetails, paidDues, billStatus, giveRewardPoints } = req.body;
    const billId = req.params.billId;
    if (!billId) {
        return response.validationError(res, 'Cannnot find the bill id');
    }
    const findBill = await billingDB.findById({ _id: billId });
    if (findBill) {
        const updateData = {};
        if (paymentDetails) {
            updateData.paymentDetails = paymentDetails;
        }
        if (paidDues) {
            updateData.paidDues = paidDues;

        }
        if (billStatus) {
            updateData.billStatus = billStatus;

        }
        if (giveRewardPoints) {
            updateData.giveRewardPoints = giveRewardPoints;
        }
        const findStaff = await staffDB.findById({ _id: findBill.serviceProvider });
        if (!findStaff) {
            return response.notFoundError(res, 'Cannot find the Staff');
        }
        const findClient = await clientDB.findOne({ clientNumber: findBill.clientNumber });
        if (!findClient) {
            return response.notFoundError(res, 'Cannot find the client');
        }
        const findService = await serviceDB.findById({ _id: findBill.serviceSelected });
        const updatedBill = await billingDB.findByIdAndUpdate({ _id: billId }, updateData, { new: true });
        if (updatedBill) {

            if (billStatus == "PAID") {
                if (giveRewardPoints) {
                    findClient.rewardPointsEarned = findClient.rewardPointsEarned + findService.rewardPoints;
                    await findClient.save();
                }
                findStaff.incentive = findService.staffIncentive + findStaff.incentive;
                await findStaff.save();

            }

            response.successResponse(res, updatedBill, 'Successfully updated the bills');

        }

        else {
            response.internalServerError(res, 'Failed to update the bill')
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the specified bill')
    }
})

const deleteBill = asynchandler(async (req, res) => {
    const { billId } = req.params;
    if (!billId) {
        return response.validationError(res, 'Cannot delete bill if id is not given');
    }
    const findBill = await billingDB.findById({ _id: billId });
    if (findBill) {
        const deletedBill = await billingDB.findByIdAndDelete({ _id: billId });
        if (deletedBill) {
            response.successResponse(res, deletedBill, "Successfully deleted the bill.")
        }
        else {
            response.internalServerError(res, "Failed to delete the bill");
        }
    }
    else {
        response.notFoundError(res, "Cannot find the specified bill");
    }
})
const getBranchwiseBills = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ':branchId') {
        return response.validationError(res, "Cannot get a branch without its id");
    }


    const allData = await billingDB.find({ branchDetails: branchId }).populate("serviceProvider").populate("serviceSelected").populate("branchDetails");
    if (allData) {
        response.successResponse(res, allData, "Successfully fetched all the datas");

    }
    else {
        response.internalServerError(res, 'Error in fetching all the datas');
    }
})
module.exports = { test, createBill, getAllBills, getAClientBill, getTotalSalesAmount, updateBillStatus, updateBillDetails, deleteBill, getBranchwiseBills, getTotalSalesAmountByBranch }; 