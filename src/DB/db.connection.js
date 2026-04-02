import mongoose from 'mongoose';
import { User } from './Models/user.model.js';
import { MONGODB_URI } from '../../config/config.service.js';

export const connectDB = async()=>{
    try{
        await mongoose.connect(MONGODB_URI);
        await User.syncIndexes();
        console.log('DB connected successfully');
    }catch(error){
        console.log(error);
    }
}