const ownerDB = require("../models/salonOwnerModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require('express-async-handler');
const jwt = require("../utils/jwt")
const bcrypt = require("bcryptjs");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Owner Route established');
})

const createOwner = asynchandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return response.validationError(res, 'Cannot create a account without proper information');
    }
    const findOwner=await ownerDB.findOne({email:email})
    if(findOwner){
        return response.errorResponse(res,'Owner Already exists . Login',400);
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
        const findOwner=await ownerDB.findById({_id:savedOwner._id}).populate("branch");
        if(!findOwner){
            return response.internalServerError(res,'Failed to create owner');
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
module.exports = { test, createOwner, loginOwner, updateOwner, getAllOwners, getAowner, deleteOwner };