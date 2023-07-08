const mongoose=require("mongoose");


const feedbackSchema=mongoose.Schema({
    appointmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Appointment"
    },
    rating:{
        type:Number,
        required:true    
    },
    description :{
        type:String,
        required:true
    }
})


const feedbackModel=mongoose.model("Feedback",feedbackSchema);
module.exports=feedbackModel;