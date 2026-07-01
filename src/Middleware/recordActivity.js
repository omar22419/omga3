
import { BadRequestException } from '../Common/index.js';
import { create } from '../DB/database.repository.js';
import { ActivityLog } from './../DB/Models/activity.model.js';

export const recordActivity = async(userId,action,resourceType,resourceId,details)=>{
    try {
        await create({
            model:ActivityLog,
            data:{
                user:userId,
                action,
                resourceId,
                details,
                resourceType
            }
        })
    } catch (error) {
        throw BadRequestException({
            message:"Can't save this activity",
            extra:error
        })
    }
}
