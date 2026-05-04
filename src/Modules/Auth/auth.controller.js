import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import { loginUser, registerUser, reSendConfirmEmail, resetForgotPasswordCode, resetPassword, verifyEmail, verifyForgotPasswordCode } from "./auth.service.js";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyForgotPasswordCodeSchema,
} from "../../Middleware/validation.middleware.js";
import { successResponse } from "../../Common/index.js";
import { asyncHandler } from "../../Middleware/asyncHandler.middleware.js";

const router = Router();

router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const data = await registerUser(req.body);
    return successResponse({
      res,
      status: 201,
      message: "User registered successfully",
      data,
    });
  }),
);

router.post(
  "/login",

  validateRequest({ body: loginSchema }),
  asyncHandler(async (req, res, next) => {
    const data = await loginUser(req);
    return successResponse({
      res,
      status: 200,
      message: "User logged in successfully",
      data,
    });
  }),
);

router.patch(
  "/verifyEmail",
  validateRequest({ body: verifyEmailSchema }),
  asyncHandler(async (req, res, next) => {
    const data = await verifyEmail(req.body);
    return successResponse({
      res,
      status: 200,
      message: "Email verified successfully",
      data,
    });
  }),
);


router.patch("/resend-confirm-email", validateRequest({body:emailSchema}),asyncHandler(async(req,res,next)=>{
  const account = await reSendConfirmEmail(req.body);
  return successResponse({
    res,
    message:"Email Sent Successfully"
  })
}))






router.post("/reset-password",validateRequest({body:emailSchema}), asyncHandler(async(req,res,next)=>{
    const result = await resetPassword(req.body);
    return successResponse({
      res,
    })
}))

router.patch("/verify-forgot-password-code",
  validateRequest({body:verifyForgotPasswordCodeSchema}) ,
   asyncHandler(async (req, res, next) => {
  await verifyForgotPasswordCode(req.body);
  return successResponse({
      res,
    })
}));


router.patch("/reset-forgot-password-code",
  validateRequest({body:resetPasswordSchema}) ,
   asyncHandler(async (req, res, next) => {
  await resetForgotPasswordCode(req.body);
  return successResponse({
    message:"Password changed successfully",
      res,
    })
}));

export default router;
