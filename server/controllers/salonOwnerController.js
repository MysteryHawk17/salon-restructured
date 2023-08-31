const ownerDB = require("../models/salonOwnerModel");
const tokenDB = require("../models/tokenModel");
const branchDB = require("../models/branchModel.js");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require('express-async-handler');
const jwt = require("../utils/jwt")
const bcrypt = require("bcryptjs");
const sendMail = require("../utils/sendmail")
const crypto = require("crypto")
const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Owner Route established');
})

const createOwner = asynchandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return response.validationError(res, 'Cannot create a account without proper information');
    }
    const findOwner = await ownerDB.findOne({ email: email })
    if (findOwner) {
        return response.errorResponse(res, 'Owner Already exists . Login', 400);
    }
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const newOwner = await ownerDB({
        name: name,
        password: hashedPassword,
        email: email,
        phone: phone !== undefined ? phone : ""
    })
    const savedOwner = await newOwner.save();

    if (savedOwner) {
        const findOwner = await ownerDB.findById({ _id: savedOwner._id }).populate("branch");
        if (!findOwner) {
            return response.internalServerError(res, 'Failed to create owner');
        }
        const token = jwt(findOwner._id);
        const result = {
            owner: findOwner,
            token: token
        };
        response.successResponse(res, result, 'Successfully saved the Owner');
    }
    else {
        response.internalServerError(res, 'failed to create a owner');
    }
})

const loginOwner = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return response.validationError(res, "Cannot login without proper information");
    }
    const findUser = await ownerDB.findOne({ email: email }).populate("branch");
    if (findUser) {
        const comparePassword = await bcrypt.compare(password, findUser.password);
        if (comparePassword) {
            const token = jwt(findUser._id);
            const result = {
                owner: findUser,
                token: token
            }
            response.successResponse(res, result, 'Login successful');
        }
        else {
            response.errorResponse(res, 'Password incorrect', 400);
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the owner');
    }
})

const forgotpassword = asynchandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        response.validationError(res, "Please fill in the field");
    }
    const user = await ownerDB.findOne({ email: email })
    if (!user) {
        response.notFoundError(res, "User not found");
    }
    else {
        const tokenExists = await tokenDB.findOne({ userId: user._id })
        if (tokenExists) {
            await tokenDB.deleteOne({ userId: user._id });
        }
        const resetToken = crypto.randomBytes(32).toString("hex") + user._id
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        console.log(resetToken)
        // console.log(hashedToken)
        const savedToken = await new tokenDB({
            userId: user._id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * (60 * 1000)

        }).save();
        console.log(savedToken)
        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
        console.log(resetUrl);
        const message =
            `<h2>Hello ${user.name}</h2>
        <p>Please click on the below link to reset the password</p>
        <p>The reset link is valid for 30 minutes</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        <p>Regards</p>`;
        const subject = "PASSWORD RESET"
        const send_to = user.email
        const sent_from = process.env.EMAIL_USER

        try {
            await sendMail(subject, message, send_to, sent_from);
            response.successResponse(res, '', "Successfully sent the mail");
        } catch {
            response.internalServerError(res, 'Not able to send the mail');
        }

    }

})
const resetpassword = asynchandler(async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const verifyToken = await tokenDB.findOne({ token: hashedToken, expiresAt: { $gt: Date.now() } })
    if (!verifyToken) {
        response.errorResponse(res, "Invalid token", 400)
    }
    const user = await ownerDB.findOne({ _id: verifyToken.userId })
    if (!user) {
        response.notFoundError(res, "User not found");
    }
    else {
        user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
        await user.save();
        response.successResponse(res, user, 'Updated password successfully');
    }
})


//change password
const changePassword = asynchandler(async (req, res) => {
    const { userid } = req.params;
    if (userid == ':userid') {
        return response.validationError(res, 'Cannot find user without the user id');
    }
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return response.validationError(res, 'Cannot change password without proper information');
        }
        const findUser = await ownerDB.findById({ _id: userid });
        if (!findUser) return response.notFoundError(res, 'Cannot find the owner');
        const comparePassword = await bcrypt.compare(oldPassword, findUser.password);
        if (!comparePassword) {
            return response.errorResponse(res, 'Incorrect password', 400);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        findUser.password = hashedPassword;
        const updatedUser = await findUser.save();
        if (!updatedUser) {
            return response.internalServerError(res, 'Failed to update the user');
        }
        response.successResponse(res, updatedUser, 'Successfully updated the password');
    }
    catch (error) {
        console.log(error)
        response.internalServerError(res, 'Error occured');
    }

})
//getallowners
const getAllOwners = asynchandler(async (req, res) => {
    const allowners = await ownerDB.find().populate("branch");
    if (allowners) {
        response.successResponse(res, allowners, "Successfully fetched all the owner");
    }
    else {
        response.internalServerError(res, 'Failed to fetch all the owner');
    }
})
//get a owner

const getAowner = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, 'Cannot get a owner without its id');

    }
    const getowner = await ownerDB.findById({ _id: id }).populate("branch")
    if (getowner) {
        response.successResponse(res, getowner, "Fetched the owner");
    }
    else {
        response.internalServerError(res, "Failed to fetch the owner");
    }
})
//update owner
const updateOwner = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot delete the Owner without its id");
    }
    const findOwner = await ownerDB.findById({ _id: id });
    if (findOwner) {
        const updateData = {};
        const { name, phone } = req.body;
        if (name) {
            updateData.name = name;
        }
        if (phone) {
            updateData.phone = phone;
        }

        const updatedOwner = await ownerDB.findByIdAndUpdate({ _id: id }, updateData, { new: true });
        if (updatedOwner) {
            response.successResponse(res, updatedOwner, 'Successfully updated the Owner');
        }
        else {
            response.internalServerError(res, 'Failed to update the owner');
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the specified owner');
    }
})
//delete owner 
const deleteOwner = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, "Cannot delete the Owner without its id");
    }
    const findOwner = await ownerDB.findById({ _id: id });
    if (findOwner) {
        const deletedOwner = await ownerDB.findByIdAndDelete({ _id: id });
        if (deletedOwner) {
            response.successResponse(res, deletedOwner, 'Successfully deleted the Owner');
        }
        else {
            response.internalServerError(res, 'Failed to delete the owner');
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the specified owner');
    }
})

//get parent branch
const findParentBranch = asynchandler(async (req, res) => {
    const { ownerId } = req.params;
    if (ownerId == ":ownerId") {
        return response.internalServerError(res, 'Owner id is required');
    }
    const findParentBranch = await branchDB.find({ ownerId: ownerId, parentBranch: undefined }).populate("ownerId").populate("staffs").populate("staffs").populate("services").populate("products").populate("parentBranch").populate({
        path: "subscriptionDetails.subscription"
    });;
    if (!findParentBranch) {
        return response.internalServerError(res, 'Failed to fetch the parent branch');
    }
    response.successResponse(res, findParentBranch, 'Founnd the branch successfully');
})
module.exports = { test, createOwner, loginOwner, updateOwner, getAllOwners, getAowner, deleteOwner, findParentBranch, forgotpassword, resetpassword, changePassword };