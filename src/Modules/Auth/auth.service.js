import { FRONTEND_URL, JWT_SECRET } from "../../../config/config.service.js";
import bcrypt from "bcrypt";
import { BadRequestException, ConflictException, decrypt, emailEmitter, emailTemplate, encrypt, ForbiddenException, NotFoundException, sendEmail, successResponse } from "../../Common/index.js";
import aj from "../../Common/services/arcjet.js";
import { createOne, findOne } from "../../DB/database.repository.js";
import { User } from "../../DB/Models/user.model.js";
import { Verification } from './../../DB/Models/verification.model.js';
import jwt from "jsonwebtoken";


export const registerUser = async(req)=>{
        const {email, password, name,phone} =req.body;
        const decision = await aj.protect(req,{email});
        // console.log(decision);
        console.log("Arcjet decision", decision.isDenied());
        if(!decision.isDenied()){
            throw ForbiddenException({message:"Email is not allowed"})
        }
        const existingUser = await findOne({
            model:User,
            filter:{email}
        })
        if(existingUser){
            throw ConflictException({message:"Email already exists"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = await createOne({
            model:User,
            data:{
                email,
                password:hashPassword,
                name,
                phone: await encrypt(phone),
            }
        })
        const verificationToken = jwt.sign({userId: newUser[0]._id},JWT_SECRET,{expiresIn:'1h'});
        const verificationLink = `${FRONTEND_URL}/verify/${verificationToken}`
        const isEmailSent = await sendEmail({to:email,subject:"Email Verification",html:emailTemplate({code:verificationLink,title:"Email Verification"})});
         
        await createOne({
            model:Verification,
            data:{
                userId: newUser[0]._id,
                token: verificationToken,
                expiresAt: new Date(Date.now()+ 1 * 60*60*1000),
            }
        })

        if(!isEmailSent){
            throw BadRequestException({message:"Email could not be sent"})
        };
        return newUser;
}

export const loginUser = async(req)=>{
    const {email,password} = req.body;
    const user = await findOne({
        model:User,
        filter:{email},
        select:'+password',
        options:{lean:true}
    });
    if(!user){
        throw NotFoundException({
            message:"Invalid email or password"
        })
    }
    if(!user.isEmailVerified){
        const existingVerification = await findOne({
            userId:user._id,
        })
        if(existingVerification && existingVerification.expiresAt>new Date()){
            throw ForbiddenException({message:"Email is not verified. Please check your email"})
        }else{
            await findByIdAndDelete()
        }
    }


    const isPasswordCorrect = await bcrypt.compare(password,user.password);

    console.log(isPasswordCorrect)
    return user;
}