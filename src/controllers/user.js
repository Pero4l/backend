require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../database");

const searchUser = async (req, res) => {
  const { query } = req.query;

  const matchedUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) || u.phone.includes(query)
  );

  if (matchedUsers.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "No users found matching the query"
    });
  }

  return res.status(200).json({
    status: "success",
    data: matchedUsers
  });

}

const finalRegister = async (req, res) => {

  const hashPassword = await bcrypt.hash(req.body.password, process.env.SALT_ROUNDS);

  const newUser = {
    id: users.length + 1,
    email: req.body.email,
    name: req.body.name,
    phone: req.body.phone,
    password: hashPassword,
    role: "user"
  };

  users.push(newUser);

  console.log(
    `User ${newUser.name} your account was registered successfully`
  );

  return res.status(200).json({
    status: "success",
    message: "User registered successfully"
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === String(email).trim()
  );

  if (!user) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password"
    });
  }

  // const passwordMatch = await bcrypt.compare(
  //   String(password).trim(),
  //   user.password
  // );

  // if (!passwordMatch) {
  //   return res.status(401).json({
  //     status: "error",
  //     message: "Invalid email or password"
  //   });
  // }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      status: "error",
      message: "JWT secret is not configured"
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  return res.status(200).json({
    status: "success",
    message: "Login successful",
    role: user.role,
    token
  });
};

const getOne = async (req, res)=>{

  const {id} = req.params;
  
  const user = users.find(
    (u) => u.id === Number(id)
  );

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found"
    });
  }

  return res.status(200).json({
    status: "success",
    data: user
  });

}



module.exports = {
  finalRegister,
  login,
  getOne,
  searchUser
};