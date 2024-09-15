const express = require('express')
const {authMiddleWare} = require('../../middlewares/auth.js');
//Importación de funciones
const { postCita, deleteCita, updateCita, getCita, verifyCita } = require('./cita.controller')
//Crear enrutador
const citaRouter = express.Router()
//Asignación de direcciones
citaRouter.post('/api/cita/create', authMiddleWare,  postCita)
citaRouter.get('/api/cita/getCita', authMiddleWare,  getCita)
citaRouter.put('/api/cita/updateCita', authMiddleWare, updateCita)
citaRouter.delete('/api/cita/deleteCita',authMiddleWare,  deleteCita)
citaRouter.put('/api/cita/verifyCita',authMiddleWare, verifyCita)

module.exports = citaRouter
