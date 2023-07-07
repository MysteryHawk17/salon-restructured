const superAdminDB = require("../models/superAdminModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require('express-async-handler');
const bcrypt = require("bcryptjs");
const jwt = require("../utils/jwt");

const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Superadmin routes established');
})


const createSuperAdmin = asynchandler(async (req, res) => {
    const { name, password, email } = req.body;
    if (!name || !password || !email) {
        return response.validationError(res, 'Cannot create admin without proper details');
    }
    const findEmail = await superAdminDB.findOne({ email: email });
    if (findEmail) {
        return response.errorResponse(res, "Account already exists. Please login", 400);
    }
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const newAdmin = await superAdminDB({
        name: name,
        password: hashedPassword,
        email: email
    })
    const savedAdmin = await newAdmin.save();

    if (savedAdmin) {
        const token = jwt(savedAdmin._id);
        const result = {
            admin: savedAdmin,
            token: token
        };
        response.successResponse(res, result, 'Successfully saved the admin');
    }
    else {
        response.internalServerError(res, 'failed to create a admin');
    }
})

const loginSuperAdmin = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return response.validationError(res, 'Cannot login without proper details');
    }
    const findUser = await superAdminDB.findOne({ email: email });
    if (findUser) {
        const comparePassword = await bcrypt.compare(password, findUser.password);
        if (comparePassword) {
            const token = jwt(findUser._id);
            const result = {
                admin: findUser,
                token: token
            }
            response.successResponse(res, result, 'Login successful');
        }
        else {
            response.errorResponse(res, 'Password incorrect', 400);
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the admin');
    }
})

const deleteSuperAdmin = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (id == ":id") {
        return response.validationError(res, 'cannot delete a superadmin without its id');
    }
    const findAdmin = await superAdminDB.findById({ _id: id });
    if (findAdmin) {
        const deletedAdmin = await superAdminDB.findByIdAndDelete({ _id: id });
        if (deletedAdmin) {
            response.successResponse(res, deletedAdmin, 'Successfully deleted the admin');
        }
        else {
            response.internalServerError(res, 'Cannot delete the admin');
        }
    }
    else {
        response.notFoundError(res, 'Cannot find the admin');
    }
})


module.exports = { test, createSuperAdmin, loginSuperAdmin, deleteSuperAdmin };