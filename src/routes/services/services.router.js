const express = require('express')
//Importación de funciones
const { getServices, postServices, deleteService, updateService } = require('./services.controller')
//Creación de enrutador
const servicesController = express.Router()
//Asignación de direcciones
servicesController.get('/api/services/get/all', getServices)
servicesController.post('/api/services/post/service', postServices)
servicesController.delete('/api/services/delete', deleteService)
servicesController.put('/api/services/update', updateService)
//Exportar enrutador
module.exports = servicesController
