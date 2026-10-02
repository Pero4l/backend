// const validateRegister = (req, res, next) => {
    
//   const { name, email, phone, password } = req.body;

//   if (!name.trim()) {
//     return res.status(400).json({
//       message: "Name is required"
//     });
//   }

//   if (name.trim().length < 4){
//     return res.status(400).json({
//         message: "Name must be at least 4 character"
//     })
//   }

//   if (!email.trim()) {
//     return res.status(400).json({
//       message: "Email is required"
//     });
//   }

//   if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
//     return res.status(400).json({
//       message: "Email is invalid"
//     });
//   }

//     if (!phone.trim()) {
//         return res.status(400).json({
//             message: "Phone number is required"
//         });
//     }

//     if (phone.trim().length !== 11) {
//         return res.status(400).json({
//             message: "Phone number must be 11 digits"
//         });
//     }  
 

//   if (!password.trim()) {
//     return res.status(400).json({
//       message: "Password is required"
//     });
//   }

//   if (password.trim().length < 6) {
//     return res.status(400).json({
//       message: "Password must be at least 6 characters"
//     });
//   }

//   const passwordPattern = /(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\/\-]).{6,}/;
//   if (!passwordPattern.test(password)) {
//     return res.status(400).json({
//       message: "Password must contain at least one uppercase letter, a number, and one special character"
//     });
//   }

//   next();
// };

// module.exports = {validateRegister};



const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(4, "Name must be at least 4 characters and include a number"),
  email: z.string().trim().email(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "invalid email"),
  password: z.string().trim().min(6, "Password must be at least 6 characters")
});

module.exports = {
  registerSchema
};



