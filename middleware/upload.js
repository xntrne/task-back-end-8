import crypto from "node:crypto";
import path from "node:path";
import multer from "multer";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + extension);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("image must be jpg, jpeg, png, webp or gif"));
    }
    cb(null, true);
  },
});

export function uploadImage(field) {
  const uploadOne = upload.single(field);

  return (req, res, next) => {
    uploadOne(req, res, (err) => {
      if (!err) return next();

      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "image must be smaller than 5MB"
          : err.message;

      res.status(422).json({ errors: { image: { errors: [message] } } });
    });
  };
}
