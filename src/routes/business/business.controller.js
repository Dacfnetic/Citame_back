//Importación de modelos de objetos
const usuario = require('../../models/users.model.js')
const business = require('../../models/business.model.js')
const services = require('../../models/services.model.js')
const workerModel = require('../../models/worker.model.js')
const citaModel = require('../../models/cita.model.js')
const mongoose = require('mongoose')
const config = require('../../config/configjson.js')
const {handleHttpError} = require('../../utils/handleError.js');
const { deleteImagesOnArrayService, deleteImagesOnArrayWorkers, deleteImagen } = require('../../config/functions.js')
const Agenda = require('../../models/agenda.js')

const PUBLIC_URL = process.env.PUBLIC_URL;

var contadorDeGetAllBusiness = 0
var contadorDePostBusiness = 0
var contadorDeDeleteBusiness = 0
var contadorDeSaveChangesFromBusiness = 0

const getAllBusiness = async (req, res) =>{
  console.log('Intentando obtener negocios por categoria')
  contadorDeGetAllBusiness++
  console.log('getAllBusiness: ' + contadorDeGetAllBusiness)
  try {
    const {category, favoritos, propios, categoriaFavoritosOPropios} = req.query;
    var allBusiness = []
    switch(categoriaFavoritosOPropios){
      case 'favoritos':
        if(favoritos == '[]') return res.status(201).send('No hay');
        const negociosFavoritos = favoritos.slice(1, -1).split(', ').map(String);
        allBusiness = negociosFavoritos.map(async (negocio)=> await business.findById(negocio))
        for(var negocio of negociosFavoritos){
          const negas = await business.findById(negocio)
          allBusiness.push(negas);
        }
        return res.status(200).json(allBusiness)
      case 'propios':
        if(propios == '[]') return res.status(201).send('No hay');
        const negociosPropios = propios.slice(1, -1).split(', ').map(String);
        for(var negocio of negociosPropios){
          const negas = await business.findById(negocio)
          allBusiness.push(negas);
        }
        return res.status(200).send(allBusiness)
      case 'categoría':
        allBusiness = await business.find({ category: category })
        if(allBusiness == null) res.status(201).send('No hay');
        return res.status(200).json(allBusiness)
    }
  } catch (e) {
    return res.status(404).json('Errosillo')
  }
}
const postBusiness = async(req, res)=> {

  /* #region borrar esto en producción */
  console.log('Intentando crear negocio')
  contadorDePostBusiness++
  console.log('postBusiness: ' + contadorDePostBusiness)
  /* #endregion */
  try {

    const {file, user, body} = req;
    const {businessName, category, email, contactNumber, direction, latitude, longitude, description, servicios} = body;

    const negocioExistente = await business.findOne({businessName: businessName, email: email});
    
    if (negocioExistente != null) res.status(202).send('El negocio ya existe');

    const nuevoNegocio = new business({
      businessName: businessName,
      category: category,
      citas: [],
      contactNumber: contactNumber,
      createdBy: user._id,
      description: description,
      direction: direction,
      email: email,
      horario: '{}',
      imgPath: `${PUBLIC_URL}/${file.filename}`,
      latitude: latitude,
      longitude: longitude,
      servicios: [],
      workers: [],
    })

    const negocioCreado = await business.create(nuevoNegocio);
    
    const userUpdated =  await usuario.findByIdAndUpdate(user._id, {
      $addToSet: { ownerBusinessIds:  negocioCreado._id}
    }, {new: true});

    res.status(201).send(userUpdated);
    
  } catch (e) {
    console.log(e)
    return res.status(404).json('Errosillo')
  }
}
const deleteBusiness = async (req, res) => {
  console.log('Intentando borrar negocio')
  contadorDeDeleteBusiness++
  console.log('DeleteBusiness: ' + contadorDeDeleteBusiness)
  const {user, body} = req;
  try {
    await business.findByIdAndDelete(body.businessId)
    if(user.ownerBusinessIds.includes(body.businessId)){
      const userUpdated =  await usuario.findByIdAndUpdate(user._id, {
        $pull: { ownerBusinessIds:  body.businessId}
      }, {new: true});
      res.status(200).json(userUpdated)
    }
  } catch (e) {
    console.log(e)
    return res.status(404).json('Errosillo')
  }
}
const saveChangesFromBusiness = async (req, res) =>{
  //Update Services
  contadorDeSaveChangesFromBusiness++
  console.log('saveChangesFromBusiness: ' + contadorDeSaveChangesFromBusiness)

  const busi = await business.findById(req.body.businessId)
  const {servicios, workers, workersIds} = busi._doc;
  const {/*requestedServices, requestedWorkers*/} = req.body;

  let previousService = busi._doc.servicios //Servicios existentes
  let nombreDeServicios = []
  let listaServices = []

  for (let i = 0; i < previousService.length; i++) {
    const negocioExistente = await services.findById(previousService[i])
    if(negocioExistente != null){
      nombreDeServicios.push(negocioExistente.nombreServicio);
    }
  }

  for (let i = 0; i < previousService.length; i++) {
    const negocioExistente = await services.findById(previousService[i])
    if(negocioExistente != null){
      listaServices.push(negocioExistente);
    }
  }
  
  let requestedServices = JSON.parse(req.body.requestedServices)

  const newServicesToInsert = await requestedServices.map((service) => {
    let nuevo = new services({
      nombreServicio: service.nombreServicio,
      businessCreatedBy: busi._doc._id,
      precio: service.precio,
      imgPath: service.imgPath,
      descripcion: service.descripcion,
      duracion: service.duracion,
      time: service.time,
    })
    return nuevo
  })


  for (var serv of newServicesToInsert) {
    if(!nombreDeServicios.includes(serv.nombreServicio)){
      listaServices.push(serv);
    }
    
  }
  const newServices = await services.insertMany(newServicesToInsert)

   //Update Workers
   let requestedWorkers = JSON.parse(req.body.requestedWorkers);

   for (let worker of requestedWorkers) {
    const usuarioDelTrabajador = await usuario.findOne({ emailUser: worker.email });
    let horasQueVaATrabajarElEsclavo = new Agenda()
    horasQueVaATrabajarElEsclavo.construirHorarioInicial(JSON.parse(worker.horario))
    const newWorker = new workerModel({
      idDeUsuario: usuarioDelTrabajador._doc._id,
      workwith: busi._doc._id,
      name: worker.name,
      email: worker.email,
      salary: worker.salary,
      imgPath: '',
      //horario: worker.horario,
      horarioDisponible: horasQueVaATrabajarElEsclavo,
      status: worker.status,
      puesto: worker.puesto,
      celular: worker.celular,
    })

   }


   
   let previousWorker = busi._doc.workers //Trabajadores existentes
   let listaWorkers = []
   listaWorkers = JSON.parse(JSON.stringify(previousWorker))
   let nuevoWorker = []
   requestedWorkers = JSON.parse(req.body.requestedWorkers)
   let contador = 0
   let emailDeTrabajadoresAntiguos = []
   for(let i = 0; i < listaWorkers.length; i++){
    const trabajadorAntiguo = await workerModel.findById(listaWorkers[i]);
    emailDeTrabajadoresAntiguos.push(trabajadorAntiguo.email);
   }
 
 
   for (let worker of requestedWorkers) {
     await usuario.findOne({ emailUser: worker.email }).then(async (docs) => {
       if (docs != null) {
         if (!emailDeTrabajadoresAntiguos.includes(worker.email)) {
           let horasQueVaATrabajarElEsclavo = new Agenda()
           const usuarioDelTrabajador = await usuario.findOne({ emailUser: worker.email });
           horasQueVaATrabajarElEsclavo.construirHorarioInicial(JSON.parse(worker.horario))
 
           const newWorker = new workerModel({
            idDeUsuario: usuarioDelTrabajador._doc._id,
            workwith: busi._doc._id,
            name: worker.name,
            email: worker.email,
            salary: worker.salary,
            imgPath: busi._doc.imgPath,
            //horario: worker.horario,
            horarioDisponible: horasQueVaATrabajarElEsclavo,
            status: worker.status,
            puesto: worker.puesto,
            celular: worker.celular,
          })
           await newWorker.save()
    
           contador++
           //const idCool = newWorker._id.toString();
           listaWorkers.push(newWorker._id)
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
  await business.findByIdAndUpdate(req.body.businessId, { $set: modificaciones })
  let respuesta = await business.findByIdAndUpdate(req.body.businessId)
  return res.status(200).send(respuesta)
}

module.exports = { getAllBusiness, postBusiness, deleteBusiness, saveChangesFromBusiness }