import { v2 as cloudinaryV2 } from "cloudinary";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../../../config/config.service.js";

cloudinaryV2.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads an in-memory file buffer (from multer.memoryStorage) to Cloudinary.
 * Returns the Cloudinary upload result, which includes `secure_url` and `public_id`.
 */
export const uploadImageBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryV2.uploader.upload_stream(
      { resource_type: "image", ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes an asset from Cloudinary by its public_id.
 * Safe to call even if the asset doesn't exist — Cloudinary just returns "not found".
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    return await cloudinaryV2.uploader.destroy(publicId);
  } catch (error) {
    console.log(`Fail in cloudinary delete operation ${error}`);
  }
};

export { cloudinaryV2 as cloudinary };
