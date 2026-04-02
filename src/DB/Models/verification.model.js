import mongoose, { Schema } from "mongoose";

const verificationSchema = new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    token:{
        type:String,
        required:true,
    },
    expiresAt:{
        type:Date,
        required:true
    },

},{
    timestamps:true
})

export const Verification  = mongoose.models.Verification || mongoose.model('Verification',verificationSchema);