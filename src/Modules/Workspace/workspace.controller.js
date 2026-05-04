import { Router } from "express";
import { authMiddleware } from "./../../Middleware/auth.middleware.js";
import {
  tokenSchema,
  workspaceSchema,
} from "./../../Middleware/validation.middleware.js";
import { asyncHandler } from "../../Middleware/asyncHandler.middleware.js";
import { successResponse } from "../../Common/index.js";
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkSpace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkSpaces,
  getWorkspaceStats,
  inviteUserToWorkspace,
} from "./workspace.service.js";
import { validateRequest } from "zod-express-middleware";
import z from "zod";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest({
    body: workspaceSchema,
  }),
  asyncHandler(async (req, res, next) => {
    const result = await createWorkSpace(req.body, req.user._id);
    return successResponse({
      message: "The Workspace created successfully",
      res,
      data: result,
    });
  }),
);

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res, next) => {
    const data = await getWorkSpaces(req.user._id);
    return successResponse({
      res,
      data,
    });
  }),
);

router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
  }),
  asyncHandler(async (req, res, next) => {
    const result = await inviteUserToWorkspace(req);
    successResponse({
      res,
      message: "Invitation sent successfully",
    });
  }),
);

router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  asyncHandler(async (req, res, next) => {
    const result = await acceptInviteByToken(req.body);
    return successResponse({
      message: "Invitation accepted successfully",
      res,
    });
  }),
);

router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
  }),
  asyncHandler(async (req, res, next) => {
    const result = await acceptGenerateInvite(req.params, req.user._id);
    return successResponse({
      message: "Invitation accepted successfully",
      res,
    });
  }),
);


router.get("/:workspaceId",authMiddleware,asyncHandler(async(req,res,next)=>{
    const result  = await getWorkspaceDetails(req.params);
    successResponse({
      res,
      data:result
    })
}))
router.get("/:workspaceId/projects",authMiddleware,asyncHandler(async(req,res,next)=>{
    const result  = await getWorkspaceProjects(req.params,req.user._id);
    successResponse({
      res,
      data:result
    })
}))
router.get("/:workspaceId/stats",authMiddleware,asyncHandler(async(req,res,next)=>{
    const result  = await getWorkspaceStats(req.params,req.user._id)
    successResponse({
      res,
      data:result
    })
}))
export default router;
