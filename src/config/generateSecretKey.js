const cryp = require("crypto");

const generarLlaveSecreta = () => {
  return cryp.randomBytes(64).toString("hex");
};

module.exports = {
  generarLlaveSecreta,
};
