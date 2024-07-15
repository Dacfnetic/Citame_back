const express = require('express');

const storageRouter = express.Router();

const {uploadMiddleware} = require('../../utils/handleStorage');
const {createFile} = require('./storageController');
const {resizeImage} = require('../../middlewares/')


storageRouter.post('/api/createFile',uploadMiddleware.single('myfile'), createFile);



module.exports = storageRouter;