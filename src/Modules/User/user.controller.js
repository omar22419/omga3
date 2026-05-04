import { Router } from "express";
import { asyncHandler } from "./../../Middleware/asyncHandler.middleware.js";
import { authMiddleware } from "../../Middleware/auth.middleware.js";
import { successResponse } from "../../Common/index.js";
import { changePassword, getUserProfile, updateUserProfile } from "./user.service.js";

const router = Router();

router.get(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res, next) => {
    const result = await getUserProfile(req.user);
    successResponse({
      res,
      data: result,
    });
  }),
);

router.patch(
  "/updateProfile",
  authMiddleware,
  asyncHandler(async (req, res, next) => {
    const result = await updateUserProfile(req.body, req.user._id);
    successResponse({
      res,
      data: result,
    });
  }),
);

router.patch(
  "/change-password",
  authMiddleware,
  asyncHandler(async (req, res, next) => {
    const result = await changePassword(req.body, req.user._id);
    successResponse({
      res,
      message:"Password updated successfully"
    });
  }),
);


export default router;
