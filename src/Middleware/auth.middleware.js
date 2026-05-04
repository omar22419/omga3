import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '../Common/index.js';
import { JWT_SECRET } from '../../config/config.service.js';
import { findById } from '../DB/database.repository.js';
import { User } from '../DB/Models/user.model.js';
import { asyncHandler } from './asyncHandler.middleware.js';

export const authMiddleware = asyncHandler(async(req, res,next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            throw UnauthorizedException({message:"Unauthorized"})
        }
        const decoded = jwt.verify(token,JWT_SECRET );
        const user =await findById({
            model:User,
            id: decoded.userId
        })
        if(!user){
            throw UnauthorizedException({message:"Unauthorized"})
        }
        req.user = user;
        next();
    }catch(error){
        console.log(error)
        throw UnauthorizedException({message:"Unauthorized"})
    }
})