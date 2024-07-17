const express = require('express');

const storageRouter = express.Router();

const {uploadMiddleware} = require('../../utils/handleStorage');
const {createFile} = require('./storageController');
const {resizeImage} = require('../../middlewares/compactImages')


storageRouter.post('/api/createFile',uploadMiddleware.single('myfile'), resizeImage, createFile);



module.exports = storageRouter;