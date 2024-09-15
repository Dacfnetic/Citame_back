//Importación de paquetes requeridos
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
//const fileUpload = require('express-fileupload')
require('dotenv').config();


//Importación de enrutadores
const usersRouter = require('./src/routes/users/users.router.js')
const businessRouter = require('./src/routes/business/business.router.js')
//const imgRouter = require('./src/routes/images/img.router.js')
const notificationRouter = require('./src/routes/notification/notification.router.js')
const citaRouter = require('./src/routes/citas/cita.router.js')
const servicesController = require('./src/routes/services/services.router.js')
const workersRouter = require('./src/routes/workers/worker.router.js')

//Creación de aplicación express
const app = express();

//cuidado donde se ubica la carpeta storage
app.use(express.static('src/storageResized'));

//Informacion del servidor
app.use(cors())
//app.use(fileUpload())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
app.use(usersRouter)
app.use(businessRouter)
app.use(servicesController)
app.use(workersRouter)
//app.use(imgRouter)
app.use(notificationRouter)
app.use(citaRouter)

//Exportación de aplicación express
module.exports = app
