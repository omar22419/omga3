import mongoose ,{ Schema } from 'mongoose';
import { GenderEnum, ProviderEnum } from '../../Common/enums/user.enum.js';

const userSchema = new Schema({
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
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
        required:function(){
            return this.provider !== "google"
        }
    },
    phone:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
    },
    confirmEmail: {
      type:Date
    },
    lastLogin:{
        type:Date
    },
    isEmailVerified:{
      type:Boolean,
      default:false
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
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.System,
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
},{
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})


userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });


export const User  = mongoose.models.User || mongoose.model('User',userSchema);