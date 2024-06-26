const jwt = require('jsonwebtoken')
const config = require('../../config/configjson')

function verifyTokenUser(req, res, next) {
  const token = req.headers['x-access-token'] //Buscar en los headers que me tienes que mandar, se tiene que llamar asi para que la reciba aca

  if (!token) {
    return res.status(401).json({
      auth: false,
      message: 'No token',
    })
  }
  //Una vez exista el JWT lo decodifica
  const decoded = jwt.verify(token, config.jwtSecret) //Verifico en base al token

  req.idUsuario = decoded.idUser //En base al id del usuario que se verifico en el usercontroller
  return res.status(200).send('Si')
}

function verifyBusinessToken(req, res, next) {
  const token = req.headers['x-acces-token'] //Buscar en los headers que me tienes que mandar, se tiene que llamar asi para que la reciba aca

  if (!token) {
    return res.status(401).json({
      auth: false,
      message: 'No token',
    })
  }
  //Una vez exista el JWT lo decodifica
  const decoded = jwt.verify(token, config.jwtSecret) //Verifico en base al token

  req.idBusiness = decoded.idNeg //En base al id del usuario que se verifico en el usercontroller
  next()
}

function verifyWorkerToken(req, res, next) {}

module.exports = {
  verifyTokenUser,
  verifyBusinessToken,
  verifyWorkerToken,
}
