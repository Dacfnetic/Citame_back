const express = require('express')
//Importación de funciones
const { postCita, deleteCita, updateCita, getCita, verifyCita } = require('./cita.controller')
//Crear enrutador
const citaRouter = express.Router()
//Asignación de direcciones
citaRouter.post('/api/cita/create', postCita)
citaRouter.get('/api/cita/getCita', getCita)
citaRouter.put('/api/cita/updateCita', updateCita)
citaRouter.delete('/api/cita/deleteCita', deleteCita)
citaRouter.put('/api/cita/verifyCita', verifyCita)

//workersRouter.put('/api/workers/updateHorario',updateHorario);
//Exportar enrutador
module.exports = citaRouter
