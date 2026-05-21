import { FRONTEND_URL, JWT_SECRET } from "../../../config/config.service.js";
import bcrypt from "bcrypt";
import {
  BadRequestException,
  compareHash,
  ConflictException,
  decrypt,
  emailEmitter,
  emailTemplate,
  encrypt,
  ForbiddenException,
  generateHash,
  NotFoundException,
  sendEmail,
  successResponse,
} from "../../Common/index.js";
import aj from "../../Common/services/arcjet.js";
import {
  createOne,
  findOne,
  findOneAndUpdate,
} from "../../DB/database.repository.js";
import jwt from "jsonwebtoken";
import {
  deleteKey,
  get,
  increment,
  otpBlockKey,
  otpKey,
  otpMaxRequestKey,
  set,
  ttl,
  baseRevokeTokenKey,
  keys,
} from "./../../Common/services/index.js";
import { generateOTP } from "./../../Common/utils/otp.js";
import { User } from "./../../DB/Models/user.model.js";
import { ProviderEnum } from "../../Common/enums/user.enum.js";

export const registerUser = async (inputs) => {
  // const {email, password, username ,phone} =inputs;
  // // const decision = await aj.protect(inputs,{email});
  // // // console.log(decision);
  // // console.log("Arcjet decision", decision.isDenied());
  // // if(!decision.isDenied()){
  // //     throw ForbiddenException({message:"Email is not allowed"})
  // // }
  // const existingUser = await findOne({
  //     model:User,
  //     filter:{email}
  // })
  // if(existingUser){
  //     throw ConflictException({message:"Email already exists"})
  // }
  // const salt = await bcrypt.genSalt(10);
  // const hashPassword = await bcrypt.hash(password, salt);
  // const newUser = await createOne({
  //     model:User,
  //     data:{
  //         email,
  //         password:hashPassword,
  //         username,
  //         phone: await encrypt(phone),
  //     }
  // })
  // const verificationToken = jwt.sign({userId: newUser[0]._id},JWT_SECRET,{expiresIn:'1h'});
  // const verificationLink = `${FRONTEND_URL}/verify/${verificationToken}`
  // const isEmailSent = await sendEmail({to:email,subject:"Email Verification",html:emailTemplate({code:verificationLink,title:"Email Verification"})});

  // await createOne({
  //     model:Verification,
  //     data:{
  //         userId: newUser[0]._id,
  //         token: verificationToken,
  //         expiresAt: new Date(Date.now()+ 1 * 60*60*1000),
  //     }
  // })

  // if(!isEmailSent){
  //     throw BadRequestException({message:"Email could not be sent"})
  // };
  // return newUser;

  const { username, email, password, phone } = inputs;
  const userCheck = await findOne({
    model: User,
    filter: { email },
  });
  if (userCheck) {
    throw ConflictException({ message: "User already exists" });
  }
  const user = await createOne({
    model: User,
    data: {
      email,
      password: await generateHash(password),
      phone: await encrypt(phone),
      username,
    },
  });

  await generateAndSendConfirmEmail({
    email,
  });

  return user;
};

const generateAndSendConfirmEmail = async ({ email }) => {
  const blockKey = otpBlockKey(email);
  const remainingBlock = await ttl(blockKey);
  if (!remainingBlock) {
    throw ConflictException({
      message: "Your have reached max trial count, please wait for some time",
    });
  }
  const maxTrialCount = otpMaxRequestKey(email);
  console.log(maxTrialCount);
  const checkMaxOtpRequest = Number((await get(maxTrialCount)) || 0);
  if (checkMaxOtpRequest >= 5) {
    await set({
      key: otpBlockKey(email),
      value: 0,
      ttl: 300,
    });
    throw ConflictException({
      message: "Your have reached max trial count, please wait for 5 minutes",
    });
  }
  const code = generateOTP();
  await set({
    key: otpKey(email),
    value: await generateHash(code),
    ttl: 120,
  });
  checkMaxOtpRequest > 0
    ? await increment(maxTrialCount)
    : await set({ key: maxTrialCount, value: 1, ttl: 300 });
  const isEmailSent = await sendEmail({
    to: email,
    subject: "Email Verification",
    html: emailTemplate({ code: code, title: "Email Verification" }),
  });
  if (!isEmailSent) {
    throw BadRequestException({ message: "Email could not be sent" });
  }
  //   emailEmitter.emit("ConfirmEmail", {
  //   to: email,
  //   subject: "Verify your email",
  //   code,
  //   title: "Confirm_email",
  // });
  return;
};

export const verifyEmail = async ({ email, otp } = {}) => {
  const user = await findOne({
    model: User,
    filter: { email, provider: ProviderEnum.System },
  });
  if (!user) {
    throw NotFoundException({ message: "Account not found" });
  }
  if (user.isEmailVerified) {
    throw ConflictException({ message: "Email already verified" });
  }
  const confirmOtp = await get(otpKey(email));
  if (!confirmOtp) {
    throw BadRequestException({
      message: "OTP has expired, please request a new one",
    });
  }
  const isValidOtp = await compareHash(otp, confirmOtp);
  console.log(isValidOtp);
  if (!isValidOtp) {
    throw BadRequestException({ message: "Invalid OTP code" });
  }

  user.confirmEmail = Date.now();
  user.isEmailVerified = true;
  await user.save();
  await deleteKey(otpKey(email));
  return;
};

export const loginUser = async (req) => {
  const { email, password } = req.body;
  const user = await findOne({
    model: User,
    filter: { email },
    select: "+password",
  });
  if (!user) {
    throw NotFoundException({
      message: "Invalid email or password",
    });
  }
  if (!user.isEmailVerified) {
    const existingVerification = await findOne({
      userId: user._id,
    });
    if (existingVerification && existingVerification.expiresAt > new Date()) {
      throw ForbiddenException({
        message: "Email is not verified. Please check your email",
      });
    } else {
      await findByIdAndDelete(existingVerification._id);
    }
  }

  const isPasswordCorrect = await compareHash(password, user.password);
  if (!isPasswordCorrect) {
    throw BadRequestException({ message: "Invalid Credentials" });
  }
  const token = jwt.sign(
    { userId: user._id, purpose: "login" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  user.lastLogin = new Date();
  await user.save();

  const userData = user.toObject();
  delete userData.password;

  return { userData, token };
};

export const reSendConfirmEmail = async (inputs) => {
  const { email } = inputs;

  const account = await findOne({
    model: User,
    filter: { email, provider: ProviderEnum.System },
  });

  if (!account) {
    throw NotFoundException({ message: "Fail to find matching account" });
  }

  if (account.isEmailVerified) {
    throw BadRequestException({ message: "Email already verified" });
  }

  const remainingOtpTtl = await ttl(otpKey(email));
  if (remainingOtpTtl > 0) {
    throw ConflictException({
      message:
        "An OTP was already sent, please wait before requesting a new one",
    });
  }

  await generateAndSendConfirmEmailOtp(email);
};

const generateAndSendConfirmEmailOtp = async (email) => {
  const blockKey = otpBlockKey(email);
  const remainingBlock = await ttl(blockKey);
  if (remainingBlock > 0) {
    throw ConflictException({
      message: "You have reached max trial count, please wait for 5 minutes",
    });
  }

  const maxTrialKey = otpMaxRequestKey(email);
  const trialCount = Number((await get(maxTrialKey)) || 0);

  if (trialCount >= 5) {
    await set({ key: blockKey, value: 1, ttl: 300 });
    await del(maxTrialKey);
    throw ConflictException({
      message: "You have reached max trial count, please wait for 5 minutes",
    });
  }

  const code = generateOTP();
  await set({
    key: otpKey(email),
    value: await generateHash(code),
    ttl: 120,
  });

  if (trialCount > 0) {
    await increment(maxTrialKey);
  } else {
    await set({ key: maxTrialKey, value: 1, ttl: 300 });
  }

  emailEmitter.emit("ConfirmEmail", {
    to: email,
    subject: "Verify your email",
    code,
    title: "Confirm_email",
  });
};

export const resetPassword = async (inputs) => {
  const { email } = inputs;
  const account = await findOne({
    model: User,
    filter: { email },
  });
  if (!account) {
    throw NotFoundException({
      message: "Account not Found",
    });
  }
  if (!account.isEmailVerified) {
    throw BadRequestException({
      message: "Please verify your email first",
    });
  }

  const maxTrialCount = otpMaxRequestKey(email);
  const checkMaxOtpRequest = Number((await get(maxTrialCount)) || 0);
  if (checkMaxOtpRequest >= 5) {
    await set({
      key: otpBlockKey(email),
      value: 0,
      ttl: 300,
    });
    throw ConflictException({
      message: "Your have reached max trial count, please wait for 5 minutes",
    });
  }
  const code = generateOTP();
  await set({
    key: otpKey(email),
    value: await generateHash(code),
    ttl: 120,
  });
  checkMaxOtpRequest > 0
    ? await increment(maxTrialCount)
    : await set({ key: maxTrialCount, value: 1, ttl: 300 });

  return emailEmitter.emit("Reset Password", {
    to: email,
    subject: "Forget Password",
    code,
    title: "Reset your password",
  });
};

export const verifyForgotPasswordCode = async (inputs) => {
  const { email, otp } = inputs;

  const hashOtp = await get(otpKey(email));

  if (!hashOtp) {
    throw NotFoundException({ message: "Expired OTP" });
  }

  const isValidOtp = await compareHash(otp, hashOtp);
  console.log(isValidOtp);
  if (!isValidOtp) {
    throw BadRequestException({ message: "Invalid OTP code" });
  }

  return;
};

export const resetForgotPasswordCode = async (inputs) => {
  const { email, otp, newPassword } = inputs;

  await verifyForgotPasswordCode({ email, otp });

  const user = await findOneAndUpdate({
    model: User,
    filter: {
      email,
      isEmailVerified: { $exists: true },
      provider: ProviderEnum.System,
    },
    update: {
      password: await generateHash(newPassword),
    },
  });

  if (!user) {
    throw NotFoundException({ message: "Fail to find account" });
  }

  const tokenKeys = await keys(baseRevokeTokenKey(user._id));
  const otpKeys = await keys(otpKey(email));

  await deleteKey([...tokenKeys, ...otpKeys]);

  return;
};
