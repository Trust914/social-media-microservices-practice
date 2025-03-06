import multer from "multer";
import path from "path";
import { MediaServiceError } from "../utils/error.util.js";
import { HTTPCODES } from "../utils/constants.util.js";
import { fileURLToPath } from "url";
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = ()=>{
  const useDir = path.join(__dirname,"../../uploads")
  if (fs.existsSync(useDir)) return useDir

  try {
     return fs.mkdirSync(useDir,{recursive:true})
  } catch (error) {
    const dirError = new MediaServiceError(`UploadDirCreation${error.name}`,HTTPCODES.INTERNAL_SERVER_ERROR,`${error.message}`,true)
    throw dirError
  }
}

const localStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir());
  },
  filename: (req, file, callback) => {
    const filename = `${file.fieldname}-${
      file.originalname
    }-${Date.now()}${path.extname(file.originalname)}`;
    callback(null, filename);
  },
});

const fileFilter = (req, file, callback) => {
  const isAllowedFileType = file.mimetype.startsWith("image") || file.mimetype.startsWith("video");
  if (!isAllowedFileType) {
    const error = new MediaServiceError(
      "InvalidFileTypeError",
      HTTPCODES.BAD_REQUEST,
      `The file type is not allowed.`,
      true,
      { uploaded: file.mimetype, allowed: ["images", "videos"] }
    );
    return callback(error, false);
  } else {
    callback(null, true);
  }
};

const upload = multer({
  storage: localStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 ,files: 5},
});

export const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      const uploadError = new MediaServiceError(
        `UploadError${err.name}`,
        HTTPCODES.BAD_REQUEST,
        `${err.message}`,
        true,
        { cause: err.cause, errorCode: err.code }
      );
      return next(uploadError);
    }
    next();
  });
};

export const uploadMultiple =
  (fieldName, maxCount = 5) =>
  (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        const uploadError = new MediaServiceError(
          `UploadError-${err.name}`,
          HTTPCODES.BAD_REQUEST,
          `${err.message}`,
          true,
          { cause: err.cause, errorCode: err.code }
        );
        return next(uploadError);
      }
      next();
    });
  };

export const uploadMixed = (fields) => (req, res, next) => {
  upload.fields(fields)(req, res, (err) => {
    if (err) {
      const uploadError = new MediaServiceError(
        `UploadError-${err.name}`,
        HTTPCODES.BAD_REQUEST,
        `${err.message}`,
        true,
        { cause: err.cause, errorCode: err.code }
      );
      return next(uploadError);
    }
    next();
  });
};
