const usuario = require('../../models/users.model')
const bussiness = require('../../models/business.model')
const jwt = require('jsonwebtoken')
const config = require('../../config/configjson')
const verifyToken = require('../Auth/verifyToken')

//Acceso al token
async function pagesUsuario(req, res, next) {
  return res.status(201).json({ auth: true, decoded })
}

async function getPublicInfo(req, res, next) {}

module.exports = {
  pagesUsuario,
  getPrivateInfo,
  getPublicInfo,
}
