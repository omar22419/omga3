import { BadRequestException, compareHash, NotFoundException } from "../../Common/index.js";
import { uploadImageBuffer } from "../../Common/services/cloudinary.service.js";
import { findById } from "../../DB/database.repository.js";
import { User } from "../../DB/Models/user.model.js";



export const getUserProfile = async (input)=>{
    const user = input.toObject();
    delete user.password;
    return user;
}

export const updateUserProfile= async(inputs,userId)=>{
    const {name, profilePicture}= inputs
    const user= await findById({
        model:User,
        id:userId
    })
    if(!user){
        return NotFoundException({message:"User not Found"})
    }
    user.username= name;
    const [firstName,lastName]= name.split(" ");
    user.firstName = firstName
    user.lastName = lastName

    user.profilePicture = profilePicture;
    await user.save();
    return user
}


export const changePassword= async( inputs, userId)=>{
    const {currentPassword,newPassword, confirmPassword}= inputs;
    const user = await findById({
        model:User,
        id:userId,
        select:"+password"
    })

    if(newPassword!==confirmPassword){
        throw BadRequestException({
            message:"New Password and confirm Password don't match"
        })
    }

    const isPasswordValid = await compareHash(currentPassword,user.password);
    if(isPasswordValid){
        throw BadRequestException({
            message: "Invalid old Password"
        })
    }

    const hashPassword = await generateHash(newPassword)
    user.password = hashPassword;
    await user.save();
    return 
}


export const uploadProfilePicture = async (file, userId) => {
    if (!file) {
        throw BadRequestException({ message: "No image file was provided" });
    }

    const user = await findById({
        model: User,
        id: userId,
        select: "+profilePicturePublicId",
    });
    if (!user) {
        return NotFoundException({ message: "User not Found" });
    }

    const publicId = `omega3/avatars/user_${userId}`;
    const previousPublicId = user.profilePicturePublicId;

    const result = await uploadImageBuffer(file.buffer, {
        public_id: publicId,
        overwrite: true,
        transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
        ],
    });

    user.profilePicture = result.secure_url;
    user.profilePicturePublicId = result.public_id;
    await user.save();

    // Clean up the old asset only if the public_id changed (e.g. legacy users)
    if (previousPublicId && previousPublicId !== result.public_id) {
        await deleteImage(previousPublicId);
    }

    const plainUser = user.toObject();
    delete plainUser.password;
    return plainUser;
}