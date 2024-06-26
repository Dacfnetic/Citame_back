require("dotenv").config();
const llaveGenerada = require("./generateSecretKey");

module.exports = {
  jwtSecret: process.env.SECRET_KEY || llaveGenerada(),
};
