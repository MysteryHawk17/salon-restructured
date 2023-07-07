const mongoose=require('mongoose');

const productsSchema=mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    mrp:{
        type:Number,
        required:true
    },
    volume:{
        type:Number,
        required:true
    },
    unit:{
        type:Number,
        required:true
    },
    barcode:{
        type:Number,
        required:true
    },
    rewardPoints:{
        type:Number,
        required:true
    },
    branchDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Branch"
    }
},{timestamps:true})

const productModel=mongoose.model("Product",productsSchema);
module.exports=productModel;