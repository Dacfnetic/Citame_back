const express = require('express');
const {validatorEmail} = require('../../validators/userValidator.js')
const {authMiddleWare} = require('../../middlewares/auth.js');
//Importación de funciones

const {
  getUser,
  postUser,
  getAllUser,
  FavoriteBusiness,
} = require('./users.controller.js')
//Crear enrutador
const usersRouter = express.Router()


//Asignación de direcciones
usersRouter.get('/api/user/get', authMiddleWare, getUser)
usersRouter.post('/api/user/create', postUser)
usersRouter.get('/api/user/get/all', getAllUser)
usersRouter.put('/api/user/favoriteBusiness',authMiddleWare,FavoriteBusiness)

//Exportar enrutador
module.exports = usersRouter
