const billingDB = require("../models/billingModel");
const clientDB = require("../models/clientModel");
const staffDB=require("../models/staffModel");
const appointmentDB = require("../models/appointmentModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Billing routes established');
})

//create bill
const createBill = asynchandler(async (req, res) => {
    const { billType, products, toGiveIncentive, clientName, clientNumber, discount, appointmentId, timeOfBilling, totalAmount, paidDues, advancedGiven, subTotal, giveRewardPoints, price, branchDetails,productIncentive } = req.body;
    if (!billType || !clientName || clientNumber == undefined || clientNumber == null || !timeOfBilling || subTotal === undefined || subTotal === null || totalAmount === undefined || totalAmount === null || paidDues === undefined || paidDues === null || advancedGiven === undefined || advancedGiven == null || !branchDetails || price == undefined || price == null || !appointmentId) {
        return response.validationError(res, "Failed to create a bill without proper details");
    }
    const findAppointment = await appointmentDB.findById({ _id: appointmentId }).populate("serviceSelected").populate("serviceProvider");
    if (!findAppointment) {
        return response.notFoundError(res, "Cannot find the appointment");
    }
    const findClient = await clientDB.findOne({ clientNumber: clientNumber });
    if (!findClient) {
        return response.notFoundError(res, 'Cannot find the client');
    }

    const newBill = new billingDB({
        billType,
        products,
        toGiveIncentive,
        clientName,
        clientNumber,
        timeOfBilling,
        subTotal,
        discount,
        totalAmount,
        paidDues,
        advancedGiven,
        branchDetails,
        price,
        appointmentId,
        giveRewardPoints
    })
    // const saveBill = await newBill.save();
    // if (!saveBill) {
    //     return response.internalServerError(res, "Cannot save the bill");
    // }
    var flag = 0;
    if (giveRewardPoints) {
        findClient.rewardPointsEarned = findClient.rewardPointsEarned + findAppointment.serviceSelected.rewardPoints;
        const saveClient = await findClient.save();
        if (!saveClient) {
            // const deleteBill=await billingDB.findByIdAndDelete({_id:saveBill._id});
            // response.internalServerError(res,"Failed to create bill");
            flag = 1;
        }
    }
    //product incentive me dikkat ho raha .
    if(toGiveIncentive==true){
        const findStaff=await staffDB.findById({_id:findAppointment.serviceProvider._id});
        if(!findStaff){
            flag=1;
        }
        findStaff.incentive=findStaff.incentive+productIncentive;
        const savedStaff=await findStaff.save();
        if(!savedStaff){
            flag=1;
        }
    }

    if (flag == 1) {
        return response.internalServerError(res, "Cannot generate the bill");
    }

    const saveBill = await newBill.save();
    if (!saveBill) {
        return response.internalServerError(res, "Cannot save the bill");
    }
    const findBill = await billingDB.findById({ _id: saveBill._id }).populate("appointmentId");
    if (!findBill) {
        return response.internalServerError(res, "Failed to save the bill");
    }
    response.successResponse(res, findBill, 'Saved the bill successfully');
})
//get all bills
const getAllBills = asynchandler(async (req, res) => {


    const allData = await billingDB.find().populate({
        path: "appointmentId",
        populate: {
            path: "serviceSelected serviceProvider"
        }
    }).populate("products.product").populate("branchDetails");
    if (allData) {
        response.successResponse(res, allData, "Successfully fetched all the bills");

    }
    else {
        response.internalServerError(res, 'Error in fetching all the bills');
    }
})

//get a client bill
const getAClientBill = asynchandler(async (req, res) => {
    const { clientNumber } = req.params;
    if (!clientNumber) {
        response.validationError(res, 'Cannot get a clients bill without the number');
        return;
    }
    const findAllBills = await billingDB.find({ clientNumber: clientNumber }).populate({
        path: "appointmentId",
        populate: {
            path: "serviceSelected serviceProvider"
        }
    }).populate("products.product").populate('branchDetails');
    if (findAllBills) {
        response.successResponse(res, findAllBills, 'Successfully fetched all the bills');
    }
    else {
        response.internalServerError(res, 'Failed to fetch the bills');
    }
})
//get total bill amount 
const getTotalSalesAmount = asynchandler(async (req, res) => {


    const result = await billingDB.aggregate([
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

//get total sales amount by branch
const getTotalSalesAmountByBranch = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ":branchId") {
        return response.validationError(res, 'Cannot find the data of the branch without its id');
    }
    const checkId = new mongoose.Types.ObjectId(branchId)
    const result = await billingDB.aggregate([
        {
            $match: {branchDetails: checkId }
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

//get branch wise bill
const getBranchwiseBills = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ':branchId') {
        return response.validationError(res, "Cannot get a branch without its id");
    }


    const allData = await billingDB.find({ branchDetails: branchId }).populate({
        path: "appointmentId",
        populate: {
            path: "serviceSelected serviceProvider"
        }
    }).populate("products.product").populate("branchDetails");
    if (allData) {
        response.successResponse(res, allData, "Successfully fetched all the datas");

    }
    else {
        response.internalServerError(res, 'Error in fetching all the datas');
    }
})

//get particular bill
const getParticularBill = asynchandler(async (req, res) => {
    const { billId } = req.params;
    if (!billId) {
        return response.validationError(res, 'Cannot delete bill if id is not given');
    }
    const findBill = await billingDB.findById({ _id: billId }).populate({
        path: "appointmentId",
        populate: {
            path: "serviceSelected serviceProvider"
        }
    }).populate("products.product").populate("branchDetails");;
    if (findBill) {
        response.successResponse(res, findBill, 'Successfully found the bill');
    }
    else {
        response.notFoundError(res, "Cannot find the specified bill");
    }
})

//delete bill
const deleteBill = asynchandler(async (req, res) => {
    const { billId } = req.params;
    if (!billId) {
        return response.validationError(res, 'Cannot delete bill if id is not given');
    }
    const findBill = await billingDB.findById({ _id: billId }).populate({
        path: "appointmentId",
        populate: {
            path: "serviceSelected serviceProvider"
        }
    }).populate("products.product").populate("branchDetails");;
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

module.exports = { test,createBill,getAllBills,getAClientBill,getParticularBill,getTotalSalesAmount,getTotalSalesAmountByBranch,deleteBill,getBranchwiseBills }