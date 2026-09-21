const {z} = require("zod");
const users = require("../database");

// const validateLogin = (req, res, next) => {
//     const { email, password } = req.body;

//     if (!email) {
//         return res.status(400).json({
//             message: "Email is required"
//         });
//     }

//     if (!password) {
//         return res.status(400).json({
//             message: "Password is required"
//         });
//     }
 
//     next()
// };


// module.exports = {validateLogin};

const loginSchema = z.object({
    email: z.string().trim().email(),
    // phone:z.string().trim().min(11, "Phone number must be at least 11 characters"),
    password: z.string().trim().min(6, "Password must be at least 6 characters")
    
})

module.exports = {
    loginSchema
}