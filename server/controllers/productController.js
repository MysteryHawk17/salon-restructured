const productDB = require("../models/productModel");
const branchDB = require("../models/branchModel");
const response = require("../middlewares/responseMiddleware");
const asynchandler = require("express-async-handler");


const test = asynchandler(async (req, res) => {
    response.successResponse(res, '', 'Product route established');
})

const createProduct = asynchandler(async (req, res) => {
    const { productName, mrp, volume, unit, barcode, rewardPoints, branchDetails,staffIncentive } = req.body;
    if (!productName || !mrp || !volume || !unit || !barcode || !rewardPoints||!staffIncentive || !branchDetails) {
        response.validationError(res, 'Please enter all the fields');
        return;
    }
    const findBranch = await branchDB.findById({ _id: branchDetails });
    if (!findBranch) {
        response.notFoundError(res, "Cannnot find the specified branch");
    }
    const newProduct = new productDB({
        productName,
        mrp,
        volume,
        unit,
        barcode,
        rewardPoints,
        staffIncentive,
        branchDetails
    })
    const savedProduct = await newProduct.save();
    findBranch.products.push(savedProduct._id);
    await findBranch.save();
    if (savedProduct) {
        response.successResponse(res, savedProduct, 'Successfully saved the product');
    }
    else {
        response.internalServerError(res, 'Failed to save the product');
    }
})
const getProductByBranch = asynchandler(async (req, res) => {
    const { branchId } = req.params;
    if (branchId == ':branchId') {
        return response.validationError(res, "Cannot get a branch without its id");
    }
    const allData = await productDB.find({ branchDetails: branchId }).populate("branchDetails");
    if (allData) {
        response.successResponse(res, allData, "Successfully fetched all the datas");

    }
    else {
        response.internalServerError(res, 'Error in fetching all the datas');
    }

})

const getAProduct = asynchandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return response.validationError(res, 'Cannot find the product without its id');
    }
    const findProduct = await productDB.findById({ _id: productId }).populate("branchDetails");
    if (findProduct) {
        response.successResponse(res, findProduct, 'Successfully fetched the data');
    }
    else {
        response.notFoundError(res, 'Cannot fetch the product');
    }
})
const deleteProduct = asynchandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return response.validationError(res, 'Cannot find Product without its id');
    }
    const findProduct = await productDB.findById({ _id: productId }).populate("branchDetails");
    if (findProduct) {
        const deletedProduct = await productDB.findByIdAndDelete({ _id: productId });
        if (deletedProduct) {
            const findBranch = await branchDB.findByIdAndUpdate({ _id: findProduct.branchDetails._id }, {
                $pull: { products: deletedProduct._id }
            });
            response.successResponse(res, deletedProduct, 'Product was deleted successfully');
        }
        else {
            response.internalServerError(res, 'Error deleting the Product');
        }
    }

    else {
        response.notFoundError(res, 'Cannot found the specified service');
    }
})


const updateProduct = asynchandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return response.validationError(res, 'Cannot find product without its id');
    }
    const findProduct = await productDB.findById({ _id: productId }).populate("branchDetails");
    if (findProduct) {
        const updateData = {};
        const { productName, mrp, volume, unit, barcode, rewardPoints,staffIncentive } = req.body;
        if (productName) {
            updateData.productName = productName;
        }
        if (mrp) {
            updateData.mrp = mrp;
        }
        if (volume) {
            updateData.volume = volume;
        }
        if (unit) {
            updateData.unit = unit;
        }
        if (barcode) {
            updateData.barcode = barcode;
        }
        if (rewardPoints) {
            updateData.rewardPoints = rewardPoints;
        }
        if (staffIncentive) {
            updateData.staffIncentive = staffIncentive;
        }
        const updatedProduct = await productDB.findByIdAndUpdate({ _id: productId }, updateData, { new: true });
        if (updatedProduct) {
            response.successResponse(res, updatedProduct, 'Successfully updated the service');
        }
        else {
            response.internalServerError(res, 'Failed to update the service');
        }

    }

    else {
        response.notFoundError(res, 'Cannot found the specified service');
    }
})



module.exports = { test ,createProduct,getProductByBranch,getAProduct,deleteProduct,updateProduct}