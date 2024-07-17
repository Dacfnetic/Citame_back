const express = require('express')
//const uploadMiddleware = require('../middlewares/uploadMiddleware')
const {authMiddleWare} = require('../../middlewares/auth.js');
const {uploadMiddleware} = require('../../utils/handleStorage.js')
const {resizeImage} = require('../../middlewares/compactImages.js');
//Importación de funciones
const {
  getAllBusiness,
  getOwnerBusiness,
  postBusiness,
  verifyOwnerBusiness,
  deleteBusiness,
  updateWorkersInBusinessbyCreateWorker,
  updateWorkers,
  updateArrayServices,
  updateBusiness,
  getFavBusiness,
  updateBusinessSchedule,
  saveChangesFromBusiness,
} = require('./business.controller.js')

//Creación de enrutador
const businessRouter = express.Router()
//Asignación de direcciones
businessRouter.get('/api/business/get/all', authMiddleWare, getAllBusiness)
businessRouter.post('/api/business/create', authMiddleWare, uploadMiddleware.single('myfile'), resizeImage, postBusiness)
businessRouter.delete('/api/business/delete', deleteBusiness)
businessRouter.put('/api/business/update', updateWorkersInBusinessbyCreateWorker)
businessRouter.put('/api/business/workerupdate', updateWorkers)
businessRouter.put('/api/business/serviceupdate', updateArrayServices)
businessRouter.put('/api/business/updateBusiness', updateBusiness)
businessRouter.put('/api/business/updateBusinessSchedule', updateBusinessSchedule)
businessRouter.post('/api/business/saveChangesFromBusiness', uploadMiddleware.fields([{ name: 'imagen', maxCount: 5}]), saveChangesFromBusiness)

//Exportar enrutador
module.exports = businessRouter
