import {Router} from 'express';
import { authMiddleware } from './../../Middleware/auth.middleware.js';
import { asyncHandler } from '../../Middleware/asyncHandler.middleware.js';
import { validateRequest } from 'zod-express-middleware';
import { projectSchema } from '../../Middleware/validation.middleware.js';
import { successResponse } from '../../Common/index.js';
import z from 'zod';
import { createProject, getProjectDetails, getProjectTasks } from './project.service.js';

const router = Router();


router.post("/:workspaceId/create-project",authMiddleware,validateRequest({
    params:z.object({
        workspaceId:z.string()
    }),
    body:projectSchema
}),asyncHandler(async (req,res,next)=>{
    const result = await createProject(req)
    successResponse({
        res,
        data:result
    })
}))

router.get("/:projectId",authMiddleware,validateRequest({
    params:z.object({
        projectId:z.string()
    }),
}),asyncHandler(async (req,res,next)=>{
    const result = await getProjectDetails(req.params,req.user._id)
    successResponse({
        res,
        data:result
    })
}))

router.get("/:projectId/tasks",authMiddleware,asyncHandler(async (req,res,next)=>{
    const result = await getProjectTasks(req.params,req.user._id)
    successResponse({
        res,
        data:result
    })
}))


export default router;
