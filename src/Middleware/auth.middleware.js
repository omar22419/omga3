import jwt from 'jsonwebtoken';
import User from '../DB/user.model.js'
import { UnauthorizedException } from '../Common/index.js';
import { JWT_SECRET } from '../../config/config.service.js';
import { findById } from '../DB/database.repository.js';

export const authMiddleware = async(req, res,next)=>{
    try{
        const token = req.headers.authorization.split(' ')[1];

        if(!token){
            throw new UnauthorizedException({message:"Unauthorized"})
        }
        const decoded = jwt.verify(token,JWT_SECRET );
        const user =await findById({
            model:User,
            id:decoded.userId
        })
        if(!user){
            throw new UnauthorizedException({message:"Unauthorized"})
        }
        req.user = user;
        next();
    }catch(error){
        throw new UnauthorizedException({message:"Unauthorized"})
    }
}