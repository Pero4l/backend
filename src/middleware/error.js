const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large (max 5MB)"
        : err.message;
    return res.status(400).json({ status: "error", message });
  }

  if (err.message === "File type not allowed") {
    return res
      .status(400)
      .json({ status: "error", message: "File type not allowed" });
  }

  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};

module.exports = errorHandler;