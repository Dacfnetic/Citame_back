//Importación de modelos de objetos
const usuario = require('../../models/users.model.js')
const business = require('../../models/business.model.js')
const services = require('../../models/services.model.js')
const workerModel = require('../../models/worker.model.js')
const citaModel = require('../../models/cita.model.js')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const config = require('../../config/configjson.js')
const {
  deleteImagesOnArrayService,
  deleteImagesOnArrayWorkers,
  deleteImagen,
} = require('../../config/functions.js')
const ImageService = require('../images/img.service.js')
const Agenda = require('../../models/agenda.js')

var contadorDeGetAllBusiness = 0;
var contadorDeGetOwnerBusiness = 0;
var contadorDeVerifyOwnerBusiness = 0;
var contadorDePostBusiness = 0;
var contadorDeDeleteBusiness = 0;
var contadorDeUpdateWorkersInBusinessbyCreateWorker = 0;
var contadorDeUpdateWorkers = 0;
var contadorDeUpdateArrayServices = 0;
var contadorDeUpdateBusiness = 0;
var contadorDeGetFavBusiness = 0;
var contadorDeUpdateBusinessSchedule = 0;
var contadorDeSaveChangesFromBusiness = 0;

async function getAllBusiness(req, res) {
  console.log('Intentando obtener negocios por categoria')
  contadorDeGetAllBusiness++;
  console.log('getAllBusiness: ' + contadorDeGetAllBusiness);
  try {
    usuario
      .findOne({ emailUser: req.get('email') })
      .then(async (docs) => {
        if (docs.emailUser == req.get('email')) {
          const allBusiness = await business.find({ category: req.get('category') })
          return res.status(200).json(allBusiness)
        }
      })
      .catch((e) => console.log(e))
  } catch (e) {
    return res.status(404).json('Errosillo')
  }
}
async function getOwnerBusiness(req, res) {
  contadorDeGetOwnerBusiness++;
  console.log('getOwnerBusiness: ' + contadorDeGetOwnerBusiness);
  try {
    console.log('Intentando obtener negocios del usuario')
    usuario
      .findOne({ emailUser: req.get('email') })
      .then(async (docs) => {
        if (docs.emailUser == req.get('email')) {
          const ownerBusiness = await business.find({ createdBy: docs._id })
          console.log('Ya tenemos la lista de negocios del usuario')
          const comprob = req.get('estado')
          if (comprob == '1') {
            console.log('Como no habian cambios no te enviamos nada')
            return res.status(200).send('1')
          }
          console.log(
            'Ahora te vamos a enviar los negocios del usuario, luego te envio las imagenes',
          )
          return res.status(201).json(ownerBusiness)
        }
      })
      .catch((e) => console.log(e))
  } catch (e) {
    return res.status(404).json('Errosillo')
  }
}
async function verifyOwnerBusiness(req, res) {
  console.log('Verificando si los negocios del usuario han cambiado')
  contadorDeVerifyOwnerBusiness++;
  console.log('verifyOwnerBusiness: ' + contadorDeVerifyOwnerBusiness);
  try {
    usuario
      .findOne({ emailUser: req.body.email })
      .then(async (docs) => {
        if (docs.emailUser == req.body.email) {
          const ownerBusiness = await business.find({ createdBy: docs._id })
          if (ownerBusiness.length != 0) {
            listaDeNombres = ownerBusiness.map((busi) => busi.businessName)
            listaDeNombresOrdenada = listaDeNombres.sort(function (a, b) {
              return b - a
            })
            nombresRecibidos = req.body.businessName
            listaRecibidaOrdenada = nombresRecibidos.sort(function (a, b) {
              return b - a
            })
            if (JSON.stringify(listaRecibidaOrdenada) === JSON.stringify(listaDeNombresOrdenada)) {
              return res.status(201).send('1')
            }
          }
          return res.status(201).send('0')
        }
      })
      .catch((e) => console.log(e))
  } catch (e) {
    return res.status(404).json('Errosillo')
  }
}
async function postBusiness(req, res) {
  console.log('Intentando crear negocio');
  contadorDePostBusiness++;
  console.log('postBusiness: ' + contadorDePostBusiness);
  try {
    let existe = true
    await business
      .findOne({
        businessName: req.body.businessName,
        email: req.body.email,
        workers: req.body.workers,
      })
      .then((docs) => {
        if (docs == null) {
          existe = false
        }
      })
    if (existe) return res.status(202).send('El negocio ya existe')
    await usuario.findOne({ emailUser: req.body.email }).then(async (docs) => {
      const nuevo = new business({
        businessName: req.body.businessName,
        category: req.body.category,
        email: req.body.email,
        createdBy: docs._id,
        workers: req.body.workers,
        contactNumber: req.body.contactNumber,
        direction: req.body.direction,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        description: req.body.description,
        horario: '{}',
        servicios: req.body.servicios,
      })
      await nuevo.save()
      return res.status(201).json(nuevo)
    })
  } catch (e) {
    console.log(e)
    return res.status(404).json('Errosillo')
  }
}
async function deleteBusiness(req, res) {
  console.log('Intentando borrar negocio')
  contadorDeDeleteBusiness++;
  console.log('DeleteBusiness: ' + contadorDeDeleteBusiness);
  try {
    let existe = true

    //Eliminar la imagen en el sistema de archivos y el modelo

    let previaImagen = ''
    let previousWorker = ''
    let previousCita = ''
    let previousWorkerImage = ''
    let previousService = ''
    let previousServiceImage = ''
    let previousFav = ''

    await business.findById(req.body.businessId).then((docs) => {
      previaImagen = docs.imgPath
    })

    item = JSON.parse(JSON.stringify(previaImagen))

    deleteImagen(item)

    //---Eliminar Workers del array y modelo---

    await business.findById(req.body.businessId).then((docs) => {
      previousWorker = docs.workers
    })

    item2 = JSON.parse(JSON.stringify(previousWorker))

    deleteImagesOnArrayWorkers(item2)

    const trabajador = await workerModel.find({ _id: { $in: item2 } })

    await workerModel.deleteMany({ _id: { $in: trabajador.map((worker) => worker._id) } })

    //---Eliminar los servicios del array y Modelo---

    await business.findById(req.body.businessId).then((docs) => {
      previousService = docs.servicios
    })

    item3 = JSON.parse(JSON.stringify(previousService))

    deleteImagesOnArrayService(item3)

    const servicioInArray = await services.find({ _id: { $in: item3 } })

    await services.deleteMany({ _id: { $in: servicioInArray.map((servicio) => servicio._id) } })

    //---Eliminar las citas y el modelo---

    /*await citaModel.findById(req.body.idCita)
        .then((docs)=>{
            previousCita = docs.citas;
        });

        item4 = JSON.parse(JSON.stringify(previousCita));

        const citaInArray = await citaModel.find( { _id: {$in: item4 } });
        await citaModel.deleteMany({ _id: {$in: citaInArray.map( (cita) =>cita._id ) } } );

        //Borrar la cita del array del usuario

        const idDate = req.body.idCita;
        const tr2 = await mongoose.startSession();
        tr2.startTransaction();

        const citaInUser = await usuario.find({ citas: {$in: idDate} })

        for await (const cit of citaInUser){

            const citaCheck = cit.citas;
            item5 = JSON.parse(JSON.stringify(citaCheck));
            const index2 = item5.findIndex(( citaU ) => citaU === idDate)
            
            if(index2 !== -1){
                item5.splice(index2,1);
            }

            cit.citas = item5;

            await cit.save(tr2)

        }
    
        await tr2.commitTransaction();*/

    //Borrar citas, el modelo entero y del array Citas

    await business.findById(req.body.businessId).then((docs) => {
      previousCita = docs.citas
    })

    arrayCitas = JSON.parse(JSON.stringify(previousCita))
    const citasB = await citaModel.find({ _id: { $in: arrayCitas } })

    await citaModel.deleteMany({ _id: { $in: citasB.map((citaD) => citaD._id) } })

    const tr3 = await mongoose.startSession()
    tr3.startTransaction()

    const citaUser = await usuario.find({ citas: { $in: idCita } })

    for await (const citU of citaUser) {
      const citaUsuario = citU.citas

      item11 = JSON.parse(JSON.stringify(citaUsuario))

      const index3 = item11.findIndex((citUs) => citUs == idCita)

      if (index3 !== -1) {
        item11.splice(index3, 1)
      }

      citU.citas = item11

      await citU.save()
    }

    await tr3.commitTransaction()

    //Borrar el modelo entero de favouriteBusiness en el array del usuario

    const idnegocio = req.body.businessId
    const tr = await mongoose.startSession()
    tr.startTransaction()

    const usuarioWithFav = await usuario.find({ favoriteBusiness: { $in: idnegocio } })

    for await (const fav of usuarioWithFav) {
      const negocioFav = fav.favoriteBusiness

      item6 = JSON.parse(JSON.stringify(negocioFav))

      const index = item6.findIndex((negocio) => negocio === idnegocio)

      if (index !== -1) {
        item6.splice(index, 1)
      }

      fav.favoriteBusiness = item6

      //Actualiza el documento del usuario
      await fav.save(tr)
    }

    await tr.commitTransaction()

    //Borrar las citas del array del usuario

    const businessF = await business.findById(req.body.businessId)
    const user = await usuario.findOne({ _id: req.body.idUser })
    const Citas = businessF.citas //Obtengo las citas de ese negocio

    Citas.pull(Citas.filter((cita) => cita._id === Citas._id))
    await user.updateOne({ _id: user._id }, { citas: Citas })

    await business.findByIdAndDelete(req.body.businessId) //Cambiar y recibir el ID

    return res.status(200).json({ message: 'Todo ok' })
  } catch (e) {
    console.log(e)
    return res.status(404).json('Errosillo')
  }
}
async function updateWorkersInBusinessbyCreateWorker(req, res) {
  console.log('Actualizando fotos del usuario')
  contadorDeUpdateWorkersInBusinessbyCreateWorker++;
  console.log('updateWorkersInBusinessbyCreateWorker: ' + contadorDeUpdateWorkersInBusinessbyCreateWorker);
  try {
    let previousWorkers = ''

    await business.findById(req.body.businessId).then((docs) => {
      previousWorkers = docs.workers
    })
    item = JSON.parse(JSON.stringify(previousWorkers))
    item.push(req.body.workerId)
    const modificaciones = { workers: item }
    let resultado = await business.findByIdAndUpdate(req.body.businessId, { $set: modificaciones })
    res.status(200).json({ message: 'Negocio Actualizado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
async function updateWorkers(req, res) {
  console.log('Actualizando trabajadores del usuario')
  contadorDeUpdateWorkers++;
  console.log('updateWorkers: ' + contadorDeUpdateWorkers);
  let item = []
  let previousWorkers = ''

  await business.findById(req.body.idBusiness).then((docs) => {
    previousWorkers = docs.workers
  })
  item = JSON.parse(JSON.stringify(previousWorkers))

  const filtro = req.body.idWorker
  const setWorker = new Set(item)
  setWorker.delete(filtro)
  const arrayWorker = Array.from(setWorker)

  const modificaciones = { workers: arrayWorker }
  //console.log('Si prro');
  let resultado = await business.findByIdAndUpdate(req.body.idBusiness, { $set: modificaciones })
  console.log(resultado)
  return res.status(200).send('Todo ok')
}
async function updateArrayServices(req, res) {
  let item = []
  contadorDeUpdateArrayServices++;
  console.log('updateArrayServices: ' + contadorDeUpdateArrayServices);

  let previousService = ''

  await business.findById(req.body.idBusiness).then((docs) => {
    previousService = docs.servicios
  })

  item = JSON.parse(JSON.stringify(previousService))
  item.push(req.body.idService)

  const modificaciones = { servicios: item }

  let resultado = await business.findByIdAndUpdate(req.body.idBusiness, { $set: modificaciones })

  console.log(resultado)
  return res.status(200).send('Todo Ok')
}
async function updateBusiness(req, res) {
  let businessId = req.body.idBusiness
  contadorDeUpdateBusiness++;
  console.log('updateBusiness: ' + contadorDeUpdateBusiness);
  const modificaciones = {
    businessName: req.body.businessName,
    category: req.body.category,
    email: req.body.email,
    contactNumber: req.body.contactNumber,
    direction: req.body.direction,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    description: req.body.description,
    horario: req.body.horario,
  }

  await business.findByIdAndUpdate(businessId, { $set: modificaciones }, (err, negocioUpdated) => {
    if (err) {
      return res.status(404).json('Errosillo')
    }

    return res.status(200).json({ business: negocioUpdated })
  })
}
async function getFavBusiness(req, res) {
  const token = req.headers['x-access-token'] //Buscar en los headers que me tienes que mandar, se tiene que llamar asi para que la reciba aca
  contadorDeGetFavBusiness++;
  console.log('getFavBusiness: ' + contadorDeGetFavBusiness);
  if (!token) {
    return res.status(401).json({
      auth: false,
      message: 'No token',
    })
  }
  //Una vez exista el JWT lo decodifica
  const decoded = jwt.verify(token, config.jwtSecret) //Verifico en base al token

  await usuario.findById(decoded.idUser).then(async (docs) => {
    const negociosFavoritos = docs.favoriteBusiness
    const negocios = await Promise.all(
      negociosFavoritos.map(async (negocio) => business.findById(negocio)),
    )
    return res.status(200).json(negocios)
  })
}
async function updateBusinessSchedule(req, res) {
  contadorDeUpdateBusinessSchedule++;
  console.log('updateBusinessSchedule: ' + contadorDeUpdateBusinessSchedule);
  console.log('Actualizando horario del negocio')
  const modificaciones = { horario: JSON.stringify(req.body.horario) }
  //console.log('Si prro');
  let resultado = await business.findByIdAndUpdate(req.body.idBusiness, { $set: modificaciones })
  return res.status(200).send('Todo ok')
}
async function saveChangesFromBusiness(req, res) {
  //Update Services
  contadorDeSaveChangesFromBusiness++;
  console.log('saveChangesFromBusiness: ' + contadorDeSaveChangesFromBusiness);
  const busi = await business.findById(req.body.businessId)
  let previousService = busi._doc.servicios //Servicios existentes
  let listaServices = []
  listaServices = JSON.parse(JSON.stringify(previousService))
  let requestedServices = JSON.parse(req.body.requestedServices);

  const nombresDeServiciosAntiguos = await listaServices.map(
    async (service) => {
      let servicio = await services.findById(service);
      return servicio.nombreServicio;
    });

  
    const newServicesToInsert = await requestedServices.map(
      (service) => {

        if(!nombresDeServiciosAntiguos.includes(service.nombreServicio)){
          let nuevo = new services({
            nombreServicio: service.nombreServicio,
            businessCreatedBy: busi._doc._id,
            precio: service.precio,
            imgPath: service.imgPath,
            descripcion: service.descripcion,
            duracion: service.duracion,
            time: service.time,
          });
          return nuevo;
        }
       
      }
        
    )
    for(var serv of newServicesToInsert){
      listaServices.push(serv._id);
    }
    const newServices = await services.insertMany(newServicesToInsert)
    
  

  //Update Workers
  let previousWorker = busi._doc.workers //Trabajadores existentes
  let listaWorkers = []
  listaWorkers = JSON.parse(JSON.stringify(previousWorker))
  let nuevoWorker = []
  let requestedWorkers = JSON.parse(req.body.requestedWorkers);
  let contador = 0;

  const emailDeTrabajadoresAntiguos = listaWorkers.map(
    async (worker)  =>  {
      let trabajador = await workerModel.findById(worker);
      return trabajador.email;
    });



  for (let worker of requestedWorkers) {
    await usuario.findOne({ emailUser: worker.email }).then(async (docs) => {
      if (docs != null) {

        if(!emailDeTrabajadoresAntiguos.includes(worker.email)){
          let horasQueVaATrabajarElEsclavo = new Agenda()
   
        horasQueVaATrabajarElEsclavo.construirHorarioInicial(JSON.parse(worker.horario));

        const newWorker = new workerModel({
          id: docs._id,
          workwith: busi._doc._id,
          name: worker.name,
          email: worker.email,
          salary: worker.salary,
          //horario: worker.horario,
          horarioDisponible: horasQueVaATrabajarElEsclavo,
          status: worker.status,
          puesto: worker.puesto,
          celular: worker.celular,
        })
        await newWorker.save()
        let hola = new ImageService();
        await hola.uploadImage({
          buffer: req.files.imagen[contador],
          id: newWorker._id,
          destiny: 'worker',
        })
        contador++;
        //const idCool = newWorker._id.toString();
        listaWorkers.push(newWorker._id);
        }


        
      }
    })
  }


  //Update horario
  let modificaciones = {
    horario: req.body.horario,
    servicios: listaServices,
    workers: listaWorkers,
  }

  //Actualizar negocio
  await business.findByIdAndUpdate(req.body.businessId, { $set: modificaciones });
  let respuesta = await business.findByIdAndUpdate(req.body.businessId);
  return res.status(200).send(respuesta);
}

//Exportar funciones
module.exports = {
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
}
