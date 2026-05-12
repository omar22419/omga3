import { Router } from "express";
import { authMiddleware } from './../../Middleware/auth.middleware.js';
import { validateRequest } from "zod-express-middleware";
import { taskSchema } from './../../Middleware/validation.middleware.js';
import { asyncHandler } from "../../Middleware/asyncHandler.middleware.js";
import z from "zod";
import { successResponse } from "../../Common/index.js";
import { achievedTask, addSubTask, createTask, getActivityByResourceId, getCommentsByTaskId, getTaskById, updateSubTask, updateTaskDescription, updateTaskTitle, watchTask } from "./task.service.js";

const router = Router();

router.post("/:projectId/create-task",authMiddleware,validateRequest({
    params: z.object({
        projectId:z.string(),
    }),
    body:taskSchema
}),asyncHandler(async(req,res,next)=>{
    const result = await createTask(req)
    successResponse({
        result,
        res,
    })
}))

router.get("/my-tasks",authMiddleware, asyncHandler(async (req,res,next)=>{
    const result = await getMyTasks(req.user._id);
    successResponse({
        res,
        data:result
    })
}))

router.get("/:taskId", authMiddleware,validateRequest({
    params:z.object({
        taskId:z.string(),
    })
}),
asyncHandler(async(req,res,next)=>{
    const result = await getTaskById(req.params.taskId)
    successResponse({
        res,
        data:result
    })
})
)

router.put("/:taskId/title",authMiddleware,validateRequest({
    params:z.object({taskId:z.string()}),
    body:z.object({title:z.string()})
}), asyncHandler(async(req,res,next)=>{
    const result = await updateTaskTitle(req.params.userId,req.body.title,req.user._id)
    successResponse({
        res,
        data:result
    })
}))

router.put("/:taskId/description",authMiddleware,validateRequest({
    params:z.object({taskId:z.string()}),
    body:z.object({description:z.string()})
}), asyncHandler(async(req,res,next)=>{
    const result = await updateTaskDescription(req.params.userId,req.body.description,req.user._id)
    successResponse({
        res,
        data:result
    })
}))

router.put("/:taskId/status",authMiddleware,validateRequest({
    params:z.object({taskId:z.string()}),
    body:z.object({status:z.string()})
}), asyncHandler(async(req,res,next)=>{
    const result = await updateTaskStatus(req.params.userId,req.body.status,req.user._id)
    successResponse({
        res,
        data:result
    })
}))


router.put("/:taskId/assignees",authMiddleware,validateRequest({
    params:z.object({taskId:z.string()}),
    body:z.object({assignees:z.array(z.string())})
}), asyncHandler(async(req,res,next)=>{
    const result = await updateTaskAssignees(req.params.userId,req.body.assignees,req.user._id)
    successResponse({
        res,
        data:result
    })
}))

router.put("/:taskId/priority",authMiddleware,validateRequest({
    params:z.object({taskId:z.string()}),
    body:z.object({priority:z.string()})
}), asyncHandler(async(req,res,next)=>{
    const result = await updateTaskPriority(req.params.userId,req.body.priority,req.user._id)
    successResponse({
        res,
        data:result
    })
}))


router.post("/:taskId/add-subtask",authMiddleware,validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
}),asyncHandler(async(req,res,next)=>{
    const result = await addSubTask(req.params.userId,req.body.title,req.user._id)
    successResponse({
        result,
        status:201,
        res,
    })
}))


router.get("/:taskId/comments",authMiddleware,validateRequest({
    params:z.object({
        taskId:z.string()
    })
}),asyncHandler(async(req,res,next)=>{
    const result = await getCommentsByTaskId(req.params.taskId)
    successResponse({
        res,
        data:result
    })
}))

router.post("/:taskId/add-comment",authMiddleware,validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ text: z.string() }),
}),asyncHandler(async(req,res,next)=>{
    const result = await addComment(req.params.userId,req.body.text,req.user._id)
    successResponse({
        result,
        status:201,
        res,
    })
}))


router.post("/:taskId/watch",authMiddleware,validateRequest({
    params:z.object({taskId:z.string()})
}),asyncHandler(async (req,res,next)=>{
    const result = await watchTask(req.params.taskId,req.user._id);
    successResponse({
        res,
        data:result
    })
}))



router.post("/:taskId/achieved",authMiddleware,validateRequest({
    params:z.object({taskId:z.string()})
}),asyncHandler(async (req,res,next)=>{
    const result = await achievedTask(req.params.taskId,req.user._id);
    successResponse({
        res,
        data:result
    })
}))

router.get("/:resourceId/activity",authMiddleware,validateRequest({
    params:z.object({resourceId:z.string()})
}),
asyncHandler(async(req,res,next)=>{
    const result = await getActivityByResourceId(req.params.resourceId)
    successResponse({
        res,
        data:result
    })
})
)

router.put("/:taskId/update-subtask/:subTaskId",authMiddleware,validateRequest({
    params:z.object({taskId:z.string()}),
    body:z.object({title:z.string()})
}),asyncHandler(async(req,res,next)=>{
    const result = await updateSubTask(req.params.taskId,req.params.subTaskId,req.body.completed,req.user._id);
    successResponse({
        res,
        data:result
    })
}))

export default router;
