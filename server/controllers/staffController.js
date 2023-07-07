const staffDB = require("../models/staffModel");
const branchDB = require("../models/branchModel");
const asynchandler = require("express-async-handler");
const response = require("../middlewares/responseMiddleware");
const cloudinary = require("../utils/cloudinary")


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Staff routes established');
})

const createStaff = asynchandler(async (req, res) => {
    const { name, dob, phone, mail, workingHrs, salary, emergencyDetails, userName, password, gender, dateOfJoining, userType, department, branchDetails } = req.body;

    if (!name || !dob || !phone || !mail || !workingHrs || !salary || !emergencyDetails || !userName || !password || !gender || !dateOfJoining || !userType || !department || !branchDetails) {
        response.validationError(res, 'Please enter the details properly');
        return;
    }
    const findBranch = await branchDB.findById({ _id: branchDetails });
    if (!findBranch) {
        return response.notFoundError(res, 'Cannot find the specified branch');
    }

    const findUserName = await staffDB.findOne({ userName: userName });
    if (findUserName) {
        response.validationError(res, 'Username should be unique');
        return;
    }
    var displayImg = ''
    if (req.files.length > 0) {
        const uploadedData1 = await cloudinary.uploader.upload(req.files[0].path, {
            folder: "Salon"
        })
        console.log(displayImg);
        displayImg = uploadedData1.secure_url;
    }
    var idProof = '';
    if (req.files.length > 1) {
        const uploadedData2 = await cloudinary.uploader.upload(req.files[1].path, {
            folder: "Salon"
        })
        console.log(idProof);
        idProof = uploadedData2.secure_url;
    }
    const newStaff = new staffDB({
        name: name,
        dob: dob,
        phone: phone,
        mail: mail,
        workingHrs: JSON.parse(workingHrs),
        salary: salary,
        emergencyDetails: JSON.parse(emergencyDetails),
        userName: userName,
        password: password,
        gender: gender,
        dateOfJoining: dateOfJoining,
        userType: userType,
        department: department,
        displayImg: displayImg,
        idProof: idProof,
        branchDetails: branchDetails
    })
    const savedStaff = await newStaff.save();
    findBranch.staffs.push(savedStaff._id);
    await findBranch.save();
    if (savedStaff) {
        response.successResponse(res, savedStaff, 'Saved the staff successfully');
    }
    else {
        response.internalServerError(res, 'Failed to save the staff');
    }

})
const getStaffsByBranch = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ':branchId') {
        return response.validationError(res, "Cannot get a branch without its id");
    }

    const allData = await staffDB.find({ branchDetails: branchId }).populate("branchDetails");
    if (allData) {
        response.successResponse(res, allData, "Successfully fetched all the datas");

    }
    else {
        response.internalServerError(res, 'Error in fetching all the datas');
    }
})
const getAStaff = asynchandler(async (req, res) => {
    const { staffId } = req.params;
    if (!staffId) {
        return response.validationError(res, 'Cannot find staff without its id');
    }
    const findStaff = await staffDB.findById({ _id: staffId }).populate("branchDetails");
    if (findStaff) {
        response.successResponse(res, findStaff, 'Successfully fetched the data');
    }
    else {
        response.notFoundError(res, 'Cannot fetch the staff');
    }
})

const deleteStaff = asynchandler(async (req, res) => {
    const { staffId } = req.params;
    if (!staffId) {
        return response.validationError(res, 'Cannot find staff without its id');
    }
    const findStaff = await staffDB.findById({ _id: staffId }).populate("branchDetails");
    if (findStaff) {
        const deleteFromCloud = await cloudinary.uploader.destroy(findStaff.idProof)
        const deleteFromCloud2 = await cloudinary.uploader.destroy(findStaff.displayImg);
        const deletedStaff = await staffDB.findByIdAndDelete({ _id: staffId });
        if (deletedStaff) {
            const findBranch=await branchDB.findByIdAndUpdate({_id:findStaff.branchDetails._id},{
                $pull:{staffs:deletedStaff._id}
            })
            response.successResponse(res, deletedStaff, 'Staff was delleted successfully');
        }
        else {
            response.internalServerError(res, 'Error deleting the staff');
        }
    }

    else {
        response.notFoundError(res, 'Cannot found the specified staff');
    }
})


const updateStaff = asynchandler(async (req, res) => {
    const { staffId } = req.params;
    if (!staffId) {
        return response.validationError(res, 'Cannot find staff without its id');
    }
    const findStaff = await staffDB.findById({ _id: staffId }).populate("branchDetails");
    if (findStaff) {
        const updateData = {};
        const { name, dob, phone, mail, workingHrs, salary, emergencyDetails, gender, dateOfJoining, userType, department } = req.body;
        if (name) {
            updateData.name = name;
        }
        if (dob) {
            updateData.dob = dob;
        }
        if (phone) {
            updateData.phone = phone;
        }
        if (mail) {
            updateData.mail = mail;
        }
        if (workingHrs) {
            updateData.workingHrs = workingHrs;
        }
        if (salary) {
            updateData.salary = salary;
        }
        if (emergencyDetails) {
            updateData.emergencyDetails = emergencyDetails;
        }
        if (gender) {
            updateData.gender = gender;
        }
        if (dateOfJoining) {
            updateData.dateOfJoining = dateOfJoining;
        }
        if (department) {
            updateData.department = department;
        }
        if (userType) {
            updateData.userType = userType;
        }
        const updatedStaff = await staffDB.findByIdAndUpdate({ _id: staffId }, updateData, { new: true });
        if (updatedStaff) {
            response.successResponse(res, updatedStaff, 'Successfully updated the staff');
        }
        else {
            response.internalServerError(res, 'failed to update the data');
        }
    }

    else {
        response.notFoundError(res, 'Cannot fetch the staff');
    }
})
const updateProfilePic = asynchandler(async (req, res) => {
    const { staffId } = req.params;
    if (!staffId) {
        return response.validationError(res, 'Cannot find staff without its id');
    }
    const findStaff = await staffDB.findById({ _id: staffId }).populate("branchDetails");
    if (findStaff) {
        if (req.files) {
            const deletePreviousData = await cloudinary.uploader.destroy(findStaff.displayImg);
            const newData = await cloudinary.uploader.upload(req.files[0].path, {
                folder: "Salon"
            })
            const updatedStaff = await staffDB.findByIdAndUpdate({ _id: staffId }, { displayImg: newData.secure_url }, { new: true });
            if (updatedStaff) {
                response.successResponse(res, updatedStaff, 'Successfully updated the profile image');
            }
            else {
                response.internalServerError(res, 'Failed to update the profile image');
            }
        }
        response.validationError(res, 'No data to update to ');
    }
    else {
        response.notFoundError(res, 'Cannot fetch the staff');
    }
})
const updateIdProof = asynchandler(async (req, res) => {
    const { staffId } = req.params;
    if (!staffId) {
        return response.validationError(res, 'Cannot find staff without its id');
    }
    const findStaff = await staffDB.findById({ _id: staffId }).populate("branchDetails");
    if (findStaff) {
        if (req.files) {
            const deletePreviousData = await cloudinary.uploader.destroy(findStaff.idProof);
            const newData = await cloudinary.uploader.upload(req.files[0].path, {
                folder: "Salon"
            })
            const updatedStaff = await staffDB.findByIdAndUpdate({ _id: staffId }, { idProof: newData.secure_url }, { new: true });
            if (updatedStaff) {
                response.successResponse(res, updatedStaff, 'Successfully updated the Id Proof');
            }
            else {
                response.internalServerError(res, 'Failed to update the Id Proof');
            }
        }
        response.validationError(res, 'No data to update to ');
    }
    else {
        response.notFoundError(res, 'Cannot fetch the staff');
    }
})

//ADD ROUTES FOR THE STAFF TO SEE ITS APPOINTMNETS



module.exports = { test, createStaff, getAStaff, updateIdProof, updateProfilePic, updateStaff, deleteStaff, getStaffsByBranch }