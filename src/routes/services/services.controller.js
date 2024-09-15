//Importación de modelos de objetos
const usuario = require('../../models/users.model.js')
const business = require('../../models/business.model.js')
const services = require('../../models/services.model.js')

async function getServices(req, res) {
  try {
    let item2 = []
    let servicioSend = []
    let contador = 0
    await business
      .findById(req.get('idBusiness'))
      .then(async (docs) => {
        const servicios = docs.servicios
        item2 = JSON.parse(JSON.stringify(servicios))
        if (item2.length == 0) {
          return res.status(201).send('No hay servicios')
        }
      })
      .catch((e) => console.log(e))

    item2.forEach(async (element) => {
      const servicio = await services.findById(element)

      servicioSend.push(servicio)
      contador++

      if (contador == item2.length) {
        return res.status(200).json(servicioSend)
      }
    })
  } catch (e) {
    return res.status(404).json('Errosillo')
  }
}

async function postServices(req, res) {
  try {
    let previousService = ''

    business.findById(req.body.idBusiness).then(async (docs) => {

      
      if (docs != null) {
        console.log('Creando Servicio')
        previousService = docs.servicios;
        const servicioNew = new services({
          nombreServicio: req.body.nombreServicio,
          businessCreatedBy: docs._id,
          precio: req.body.precio,
          imgPath: req.body.imgPath,
          descripcion: req.body.descripcion,
          duracion: req.body.duracion,
          time: req.body.time,
        })
       
        await servicioNew.save()

        //update del array del business

        let item = [];
        item = JSON.parse(JSON.stringify(previousService));
        item.push(servicioNew);

        const modificaciones = { servicios: item }

        await business.findByIdAndUpdate(req.body.idBusiness, { $set: modificaciones });
        

        //Get del service

        let item2 = []
        let servicioSend = []
        let contador = 0
        await business.findById(req.body.idBusiness)
          .then(async (docs) => {
            const servicios = docs.servicios
            item2 = JSON.parse(JSON.stringify(servicios))
            if (item2.length == 0) {//Pendiente de borrar por si acaso 
              return res.status(201).send('No hay servicios')
            }
          })
        .catch((e) => console.log(e))
        
        await item2.forEach(async (element) => {
          const servicio = await services.findById(element)
    
          servicioSend.push(servicio)
          contador++
    
          if (contador == item2.length) {
            return res.status(200).json(servicioSend)
          }
        })
        
      }
      //Verificar si el servicio ya existe
      //return res.status(202).send({ sms: 'El Servicio ya existe' }) //Cambiar porque est[a raro]
    })
  } catch (e) {
    return res.status(404).json('Errosillo')
  }
}

async function deleteService(req, res) {
  try {
    await servicesModel.findByIdAndDelete(req.body.idService)
    return res.status(200).json({ message: 'Borrado Con exito' })
  } catch (e) {
    return res.status(404).json('Error al eliminar.')
  }
}

async function updateService(req, res) {
  let serviceId = req.body.idService

  const serviceUpdate = {
    nombreServicio: req.body.nombreServicio,
    precio: req.body.precio,
    imgPath: req.body.imgPath,
    descripcion: req.body.descripcion,
    duracion: req.body.duracion,
  }

  await services.findByIdAndUpdate(serviceId, { $set: serviceUpdate }, (err, servicioUpdated) => {
    if (err) {
      return res.status(404).json('Error')
    }

    return res.status(200).json({ services: serviceUpdate })
  })
}

module.exports = {
  getServices,
  postServices,
  deleteService,
  updateService,
}
