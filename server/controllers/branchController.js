const branchDB = require("../models/branchModel");
const ownerDB = require("../models/salonOwnerModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require('express-async-handler');
const sendmail = require("../utils/sendmail");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', "branch routes established")
})

const createBranch = asynchandler(async (req, res) => {
    const { branchName, ownerId, branchEmail, branchPassword, parentId } = req.body;
    if (!branchName || !ownerId || !branchEmail || !branchPassword) {
        return response.validationError(res, 'Cannot generate a branch request without the id');
    }
    const findBranch = await branchDB.findOne({ branchEmail: branchEmail })
    if (findBranch) {
        return response.errorResponse(res, 'Cannot create branch with the same login', 400)
    }
    const newBranchData = {
        branchName: branchName,
        branchEmail: branchEmail,
        branchPassword: branchPassword,
        ownerId: ownerId
    };
    if (parentId) {
        newBranchData.parentBranch = parentId;
    }
    const findOwner = await ownerDB.findById({ _id: ownerId });
    if (!findOwner) {
        return response.errorResponse(res, 'Cannot find the owner', 400);
    }
    const newBranch = new branchDB(newBranchData);
    findOwner.branch.push(newBranch._id);
    await findOwner.save();
    const savedBranch = await newBranch.save();
    if (!savedBranch) {
        return response.internalServerError(res, 'cannot create the branch');
    }

    if (parentId) {
        const parentUpdate = await branchDB.findByIdAndUpdate({ _id: parentId }, {
            $push: { childrenBranch: newBranch._id }
        })

        if (parentUpdate) {
            response.successResponse(res, savedBranch, 'Successfully saved the branch and updated the parent')
        }
        else {
            response.successResponse(res, savedBranch, 'Successfully saved the branch but failed to update the parent')
        }
        return;
    }
    response.successResponse(res, savedBranch, 'Successfully saved the branch.');


})
//login branch
const branchLogin = asynchandler(async (req, res) => {
    const { branchEmail, branchPassword } = req.body;
    if (!branchEmail || !branchPassword) {
        return response.validationError(res, 'Cannot login without proper informations');
    }
    const findBranch = await branchDB.findOne({ branchEmail: branchEmail });
    if (findBranch) {
        if (findBranch.branchPassword == branchPassword) {
            if (findBranch.activeStatus == "APPROVED") {
                response.successResponse(res, findBranch, 'Login successful');
            }
            else {
                response.errorResponse(res, 'Cannot login.Branch login not approved', 400);

            }
        }
        else {
            response.errorResponse(res, 'Incorrect password', 400);
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the specified branch');
    }
})
//get all branches
const getAllBranch = asynchandler(async (req, res) => {
    const allBranches = await branchDB.find();
    if (allBranches) {
        response.successResponse(res, allBranches, 'Successfully fetched the branches');
    }
    else {
        response.internalServerError(res, 'Branches cannot be fetched');
    }
})

//get all childen branch
const getAllChildrenBranch = asynchandler(async (req, res) => {
    const { parentId } = req.params;
    if (parentId == ":parentId") {
        return response.validationError(res, 'Cannot find children without parent id');
    }
    const findAllChildren = await branchDB.find({ parentId: parentId });
    if (findAllChildren) {
        response.successResponse(res, findAllChildren, 'Successfully got all the sub branches')
    }
    else {
        response.internalServerError(res, "Cannot fetch all the branches");
    }
})

//get a single branch
const getSingleBranch = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ":branchId") {
        return response.validationError(res, 'Cannot find the branch without its id');
    }
    const findBranch = await branchDB.findById({ _id: branchId }).populate("ownerId").populate("staffs").populate("services").populate("products").populate("parentBranch").populate({
        path: "subscriptionDetails.subscription"
    });
    if (findBranch) {
        response.successResponse(res, findBranch, "Fetched the branch successfully");
    }
    else {
        response.notFoundError(res, "cannot find the branch");
    }

})

//update branch
const updateBranch = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ":branchId") {
        return response.validationError(res, 'Cannot find the branch without its id');
    }
    const findBranch = await branchDB.findById({ _id: branchId }).populate("ownerId").populate("staffs").populate("staffs").populate("services").populate("products").populate("parentBranch").populate({
        path: "subscriptionDetails.subscription"
    });
    if (findBranch) {
        const { branchName, branchEmail, branchPassword } = req.body;
        if (branchName) {
            findBranch.branchName = branchName;
        }
        if (branchEmail) {
            findBranch.branchEmail = branchEmail
        }
        if (branchPassword) {
            findBranch.branchPassword = branchPassword;
        }
        await findBranch.save();
        response.successResponse(res, findBranch, "Fetched and updated the branch successfully");
    }
    else {
        response.notFoundError(res, "cannot find the branch");
    }

})


//delete branch
const deleteBranch = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ":branchId") {
        return response.validationError(res, 'Cannot find the branch without its id');
    }
    const findBranch = await branchDB.findById({ _id: branchId }).populate("ownerId").populate("staffs").populate("staffs").populate("services").populate("products").populate("parentBranch").populate({
        path: "subscriptionDetails.subscription"
    });
    if (findBranch) {
        const deletedBranch = await branchDB.findByIdAndDelete({ _id: branchId });
        const findParent = await branchDB.findByIdAndUpdate({ _id: deletedBranch.parentBranch }, {
            $pull: { childrenBranch: deletedBranch._id }
        }, { new: true });
        const findOwner = await branchDB.findByIdAndUpdate({ _id: deletedBranch.ownerId }, {
            $pull: { branch: deletedBranch._id }
        })
        if (!deletedBranch) {
            return response.internalServerError(res, 'Cannot delete the branch')
        }
        response.successResponse(res, deletedBranch, "Fetched and deleted the branch successfully");
    }
    else {
        response.notFoundError(res, "cannot find the branch");
    }
})


//buy subscription for branch

const buySubscription = asynchandler(async (req, res) => {
    const { branchId, subscriptionId, subscriptionDuration } = req.body;
    if (!branchId || !subscriptionId || !subscriptionDuration) {
        return response.validationError(res, "Cannot buy subscription without the details");

    }
    const findBranch = await branchDB.findById({ _id: branchId });
    if (!findBranch) {
        response.notFoundError(res, 'Cannot find the branch');
    }
    const startDate = new Date();
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + parseInt(subscriptionDuration), startDate.getDate());
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const subscriptionDetails = {
        subscription: subscriptionId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        paymentStatus: "PENDING"
    }
    findBranch.subscriptionDetails = subscriptionDetails;
    await findBranch.save();
    response.successResponse(res, findBranch, "successfully Choosed  the subscription");
})

//get all pending approvals
const pendingBranches = asynchandler(async (req, res) => {
    const getAllPendingBranches = await branchDB.find({ activeStatus: "PENDING" }).populate("ownerId").populate("staffs").populate("staffs").populate("services").populate("products").populate("parentBranch").populate({
        path: "subscriptionDetails.subscription"
    });
    if (getAllPendingBranches) {
        response.successResponse(res, getAllPendingBranches, "Successfully fetched the branches");
    }
    else {
        response.internalServerError(res, 'Cannot find the branches');
    }
})
// TODO: Improve this funtionality
//subscription approval
const updateBranchStatus = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    const { status } = req.body;
    if (branchId == ":branchId" || !status) {
        response.validationError(res, 'Parametes not enough for updating the field');
        return;
    }
    const findBranch = await branchDB.findById({ _id: branchId }).populate("ownerId").populate("staffs").populate("staffs").populate("services").populate("products").populate("parentBranch").populate({
        path: "subscriptionDetails.subscription"
    });
    if (!findBranch) {
        return response.notFoundError(res, 'Cannot find the branch');
    }
    findBranch.activeStatus = status;
    await findBranch.save();
    const subject = "UPDATES REGARDING YOUR SUBSCRIPTION "
    const send_to = findBranch.ownerId.email
    const sent_from = process.env.EMAIL_USER
    if (status === 'APPROVED') {
        const message =
            `<h2>Hello ${findBranch.ownerId.name}</h2>
        <p>This is to inform you that your subscription request for the branch ${findBranch.branchName} has been approved.</p>
        <p>Please use the specified login creadentials to login into the plateform and enjoy its services.</p>
        <p><h2>email:</h2>${findBranch.branchEmail}</p>
        <p><h2>password:</h2>${findBranch.branchPassword}</p>
        <p>Regards</p>`;
        try {
            await sendmail(subject, message, send_to, sent_from);
            response.successResponse(res, '', "Successfully sent the mail");
        } catch {
            response.internalServerError(res, 'Not able to send the mail');
        }

    }
    else if (status === 'CANCELLED BY ADMIN') {
        const message = `<h2>Hello ${findBranch.ownerId.name}</h2>
        <p>This is to inform you that your subscription request for the branch ${findBranch.branchName} has unfortunately been cancelled..</p>
        <p>We are sorry for this unfortunate incident.</p>
        <p>If you still wish to get a subscritiop please write us at </p>
        <p>${process.env.EMAIL}    </p>
        <p>Regards</p>`
        try {
            await sendmail(subject, message, send_to, sent_from);
            response.successResponse(res, '', "Successfully sent the mail");
        } catch {
            response.internalServerError(res, 'Not able to send the mail');
        }
    }

})


module.exports = { test, createBranch, branchLogin, updateBranch, getAllBranch, getAllChildrenBranch, getSingleBranch, deleteBranch, buySubscription, pendingBranches, updateBranchStatus }