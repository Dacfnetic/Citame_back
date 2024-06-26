const express = require('express')
//Importación de funciones
const { enviarNotificacion } = require('./notification.controller')
//Creación de enrutador
const notificationRouter = express.Router()
//Asignación de direcciones
notificationRouter.post('/api/notifications/send', enviarNotificacion)
//Exportar enrutador
module.exports = notificationRouter
