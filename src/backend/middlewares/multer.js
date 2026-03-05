import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];

export const upload = multer({
  storage,

  limits: {
    fileSize: 6 * 1024 * 1024, // 6MB
  },

  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm yuklash mumkin (jpg, jpeg, png, webp, svg)"));
    }
  },
});
