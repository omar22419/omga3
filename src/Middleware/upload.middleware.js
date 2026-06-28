import multer from "multer";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_MB = 5;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error("Only JPEG, PNG, WEBP, or GIF images are allowed");
    error.cause = { status: 400 };
    return cb(error);
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});


export const uploadAvatar = (req, res, next) => {
  avatarUpload.single("avatar")(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        error.cause = { status: 400 };
        if (error.code === "LIMIT_FILE_SIZE") {
          error.message = `Image must be smaller than ${MAX_FILE_SIZE_MB}MB`;
        }
      }
      return next(error);
    }
    next();
  });
};
