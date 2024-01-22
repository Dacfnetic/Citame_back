//Importación de paquetes requeridos
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//Importación de enrutadores
const usersRouter = require('./routes/users/users.router.js');
const businessRouter = require('./routes/business/business.router.js');
const workersRouter = require('./routes/workers/worker.router.js');
const servicesRouter = require('./routes/services/services.router.js');
const imgRouter = require('./routes/images/img.router.js');
const notificationRouter = require('./routes/notification/notification.router.js');
const citaRouter = require('./routes/citas/cita.router.js');
//Creación de aplicación express
const app = express();
//Informacion del servidor
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(usersRouter);
app.use(businessRouter);
app.use(workersRouter);
app.use(imgRouter);
app.use(notificationRouter);
app.use(servicesRouter);
app.use(citaRouter);

//Exportación de aplicación express
module.exports = app;