import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV

const envPath = {
    development: `.env.development`,
    production: `.env.production`,
}
console.log({ en: envPath[NODE_ENV] });
config({ path: resolve(`./config/${envPath[NODE_ENV]}`) })


export const PORT = process.env.PORT || 5000;

// DB 
export const MONGODB_URI = process.env.MONGODB_URI;

export const JWT_SECRET = process.env.JWT_SECRET;

export const FRONTEND_URL = process.env.FRONTEND_URL;

export const ENC_BYTE = process.env.ENC_BYTE;


// ==== Email ====
export const EMAIL_APP = process.env.EMAIL_APP;
export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;


export const APPLICATION_NAME = process.env.APPLICATION_NAME



export const User_TOKEN_SECRET_KEY = process.env.User_TOKEN_SECRET_KEY;
export const System_TOKEN_SECRET_KEY = process.env.System_TOKEN_SECRET_KEY;
export const User_REFRESH_TOKEN_SECRET_KEY = process.env.User_REFRESH_TOKEN_SECRET_KEY;
export const System_REFRESH_TOKEN_SECRET_KEY = process.env.System_REFRESH_TOKEN_SECRET_KEY;
export const REFRESH_EXPIRES_IN = parseInt(process.env.REFRESH_EXPIRES_IN);
export const ACCESS_EXPIRES_IN = parseInt(process.env.ACCESS_EXPIRES_IN);


export const OTP_EXPIRES_IN_MINUTES = parseInt(process.env.OTP_EXPIRES_IN_MINUTES ?? '5')


export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
console.log({SALT_ROUND});

export const REDIS_URI = process.env.REDIS_URI
