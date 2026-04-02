import {Router} from 'express';
import { validateRequest } from 'zod-express-middleware';
import { loginUser, registerUser } from './auth.service.js';
import { loginSchema, registerSchema } from '../../Middleware/validation.middleware.js';
import { successResponse } from '../../Common/index.js';

const router = Router();


router.post('/register',validateRequest({body:registerSchema}),async(req,res,next)=>{
    try{
        const data = await registerUser(req);
        return successResponse({res,status:201,message:"User registered successfully",data});
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.post('/login',validateRequest({body:loginSchema}),async(req,res,next)=>{
    try{
        const data = await loginUser(req)
        return successResponse({res,status:200,message:"User logged in successfully",data});
    }catch(error){
        console.log(error.status);
        return 
    }
})




export default router;
