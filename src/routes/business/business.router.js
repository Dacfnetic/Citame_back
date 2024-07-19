const express = require('express')
const {authMiddleWare} = require('../../middlewares/auth.js');
const {uploadMiddleware} = require('../../utils/handleStorage.js')
const {resizeImage} = require('../../middlewares/compactImages.js');
const { getAllBusiness, postBusiness, deleteBusiness, saveChangesFromBusiness } = require('./business.controller.js')

const businessRouter = express.Router()

//Asignación de direcciones
businessRouter.get('/api/business/get/all', authMiddleWare, getAllBusiness)
businessRouter.post('/api/business/create', authMiddleWare, uploadMiddleware.single('myfile'), resizeImage, postBusiness)
businessRouter.delete('/api/business/delete', authMiddleWare, deleteBusiness)
businessRouter.post('/api/business/saveChangesFromBusiness', uploadMiddleware.fields([{ name: 'imagen', maxCount: 5}]), saveChangesFromBusiness)

//Exportar enrutador
module.exports = businessRouter