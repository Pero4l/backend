const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain"
];

const BASE_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, BASE_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, `${name}-${unique}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

module.exports = upload;