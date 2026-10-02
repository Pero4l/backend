const express = require("express");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

const app = express();

// Routes import
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");
const userRoutes = require("./routes/user.route");
const roleRoutes = require("./routes/role.route");
const uploadRoutes = require("./routes/upload.route");

// Middleware
app.disable("x-powered-by");
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(logger);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20
});

// Routes
app.get("/", logger, (req, res) => {
  res.status(200).json({
    "status": "success",
    "message": "Welcome, API is running"
  });
});

app.use("/role", apiLimiter, roleRoutes);
app.use("/file", apiLimiter, uploadRoutes);
app.use("/user", logger, apiLimiter, userRoutes);

// Error handler (must be last, 4-arg middleware)
app.use(errorHandler);

module.exports = app;