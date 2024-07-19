const express = require('express');
const {validatorEmail} = require('../../validators/userValidator.js');
const {authMiddleWare} = require('../../middlewares/auth.js');
const { getUser, postUser, toggleFavoriteBusiness } = require('./users.controller.js');

const usersRouter = express.Router();

//Asignación de direcciones
usersRouter.get('/api/user/get', authMiddleWare, getUser);
usersRouter.post('/api/user/create', postUser);
usersRouter.put('/api/user/favoriteBusiness',authMiddleWare, toggleFavoriteBusiness);

//Exportar enrutador
module.exports = usersRouter;