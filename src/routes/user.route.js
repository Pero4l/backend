const express = require("express");
const router = express.Router();
const {finalRegister, login, getOne, searchUser } = require("../controllers/user");
const {validate} = require("../middleware/validate")
const {authenticate} = require("../middleware/authentication");
const {registerSchema} = require("../validators/reg")
const {loginSchema} = require("../validators/login")
// const {validateRegister} = require("../validators/reg")
// const {validateLogin} = require("../validators/login")
// const {validateRegister} = require("../validators/reg")
// const {validateLogin} = require("../validators/login")

router.post("/register", validate(registerSchema), finalRegister);
router.get("/", authenticate, searchUser);
router.post("/login", validate(loginSchema), login);
router.get("/:id", authenticate, getOne);




module.exports = router;