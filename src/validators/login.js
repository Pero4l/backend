const {z} = require("zod");

const loginSchema = z.object({
    email: z.string().trim().email(),
    // phone:z.string().trim().min(11, "Phone number must be at least 11 characters"),
    password: z.string().trim().min(6, "Password must be at least 6 characters")
    
})

module.exports = {
    loginSchema
}