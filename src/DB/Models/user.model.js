import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    phone:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    lastLogin:{
        type:Date
    },
    is2FAEnabled:{
        type:Boolean,
        default:false
    },
    twoFAOtp:{
        type:String,
        select:false
    },
    twoFAOtpExpires:{
        type:Date,
        select:false
    }
},{
    timestamps:true
})

export const User  = mongoose.models.User || mongoose.model('User',userSchema);