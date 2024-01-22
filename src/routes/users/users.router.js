const express = require('express');
//Importación de funciones
const { verifyTokenUser,
    verifyBusinessToken,
    verifyWorkerToken} = require('../Auth/verifyToken.js');
const { getUser, postUser, getAllUser, updateUser,FavoriteBusiness,} = require('./users.controller.js');
//Crear enrutador
const usersRouter = express.Router();
//Asignación de direcciones
usersRouter.get('/api/user/get',getUser);
usersRouter.post('/api/user/create',postUser);
usersRouter.get('/api/user/get/all',getAllUser);
usersRouter.put('/api/user/updateUser',updateUser);
usersRouter.put('/api/user/favoriteBusiness',FavoriteBusiness);
usersRouter.get('/api/verifyTokenUser', verifyTokenUser);
//Exportar enrutador
module.exports = usersRouter;