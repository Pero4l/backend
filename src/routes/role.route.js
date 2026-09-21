const express = require("express");
const router = express.Router();

const {admin, user} = require("../controllers/adminController");
const {authenticate} = require("../middleware/authentication");
const {authorization} = require("../middleware/authorization");

router.get("/admin", authenticate, authorization, admin);
router.get("/user", authenticate, user);

module.exports = router;


