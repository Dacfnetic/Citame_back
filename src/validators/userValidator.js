const {check} = require('express-validator');
const {validatorResults} = require('../utils/handleValidator');


const validatorEmail  = [
    check("emailUser").exists().notEmpty(),
    (req,res,next)=> validatorResults(req,res,next)
]

module.exports = {validatorEmail}