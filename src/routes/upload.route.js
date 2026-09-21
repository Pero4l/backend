const express = require("express");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
  "/upload",
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    res.json({
      message: "File uploaded successfully",
      file: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  }
);

module.exports = router;