const usuario = require('../../models/users.model')
const citaModel = require('../../models/cita.model')
const tolkien = require('../../models/deviceToken.model.js')
const workerModel = require('../../models/worker.model')
const jwt = require('jsonwebtoken')
var AWS = require('aws-sdk')
const Agenda = require('../../models/agenda')
const config = require('../../config/configjson.js')
const { default: mongoose } = require('mongoose')
const businessModel = require('../../models/business.model')
var contadorDePostCita = 0;
var contadorDeGetCita = 0;
var contadorDeDeleteCita = 0;
var contadorDeVerifyCita = 0;
var contadorDeUpdateCita = 0;

//import { Agenda } from ('../../models/agenda');

async function getCita(req, res) {
  contadorDeGetCita++;
  console.log('GetCita' + contadorDeGetCita);
  try {
    citaModel
      .findById({ idCita: req.get('_id') })
      .then(async (docs) => {
        if (docs.idCita == req.get('_id')) {
          const allDates = ''
          return res.status(200).json(allDates)
        }
      })
      .catch((e) => console.log(e))
  } catch (e) {
    return res.status(404).json('Errosillo')
  }
}

async function postCita(req, res) {
  contadorDePostCita++;
  console.log('postCita' + contadorDePostCita);
  try {
    const token = req.headers['x-access-token'] //Buscar en los headers que me tienes que mandar, se tiene que llamar asi para que la reciba aca

    if (!token) {
      return res.status(401).json({
        auth: false,
        message: 'No token',
      })
    }
    //Una vez exista el JWT lo decodifica
    const decoded = jwt.verify(token, config.jwtSecret) //Verifico en base al token

    const cita = req.body.cita
    const dateCreated = new citaModel({
      creadaBy: decoded.idUser,
      recibidaPor: req.body.idWorker,
      //descripcionCita: req.body.descripcionCita,
      citaHorario: cita,
      statusCita: 'Pendiente',
      servicios: req.body.servicios,
    })

    const trabajador = await workerModel.findById(req.body.idWorker);
    const citado = await usuario.findById(trabajador.id);
    const user = await usuario.findById(decoded.idUser);

    //Manipular agenda con horario cita y devolver horario disponible

    let agenda = new Agenda()
    agenda.establecerHorarios(trabajador._doc.horarioDisponible)
    const funciona = agenda.updateWorkerHorario(cita, dateCreated._id)

    if (funciona) {
      dateCreated.save()
      const trabajador = await workerModel.findByIdAndUpdate(req.body.idWorker, {
        $push: { citasHechas: dateCreated },
      })
      await businessModel.findByIdAndUpdate(req.body.idBusiness, { $push: { citas: dateCreated } })
      const cliente = await usuario.findByIdAndUpdate(decoded.idUser, { $push: { citas: dateCreated } })
      const trabajadorComoUsuario = await usuario.findByIdAndUpdate(trabajador._doc.id, { $push: { citas: dateCreated } })
      await workerModel.findByIdAndUpdate(req.body.idWorker, {
        $set: { horarioDisponible: agenda },
      })

      await tolkien.findOne({ token: citado.deviceTokens[0] }).then(async (docs) => {
        if (docs != null) {

          var payload = {
            default: 'default',
            GCM: {
              notification: {
                body: 'El usuario ' + cliente._doc.userName + ' quiere hacer una cita con vos en tal hora',
                title: 'Nueva cita',
                sound: 'default',
              }
            }
          }
          payload.GCM = JSON.stringify(payload.GCM);
          payload = JSON.stringify(payload);


        }
      });


      return res.status(201).send('Todo ok')
    } else {
      return res.status(202).send('Mal, muy mal')
    }
  } catch (e) {
    return res.status(404).json('Errosillo')
  }
}

async function deleteCita(req, res) {
  //Borrar la cita que esten dentro del business
  contadorDeDeleteCita++;
  console.log('DeleteCita' + contadorDeDeleteCita);
  try {
    const idCita = req.body.idCita
    const tr1 = await mongoose.startSession()
    tr1.startTransaction()

    const citaNegocio = await businessModel.find({ citas: { $in: idCita } })

    for await (const cit of citaNegocio) {
      const citaBusiness = cit.citas

      item9 = JSON.parse(JSON.stringify(citaBusiness))

      const index = item9.findIndex((citass) => citass == idCita)

      if (index !== -1) {
        item9.splice(index, 1)
      }

      cit.citas = item9
      await cit.save(tr1)
    }
    await tr1.commitTransaction()

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

    await tr3.commitTransaction();

    //Tomar el horario y borrarlo de la agenda


    await citaModel.findByIdAndDelete(idCita)
    return res.status(200).json({ message: 'TodoOk' })
  } catch (e) {
    return res.status(404).json({ message: 'No se puede borrar la cita' })
  }
}

async function verifyCita(req,res){
  contadorDeVerifyCita++;
  console.log('verifyCita' + contadorDeVerifyCita);
  const idCita = req.body.idCita;
  const datosDeCita = await citaModel.findById(idCita);
  const cliente = await usuario.findById(datosDeCita._doc.creadaBy);
  const worker = await workerModel.findById(datosDeCita._doc.recibidaPor);
  //const cita = req.body.cita;
  const status = req.body.status;

  if(status == 'Aprobada'){
  const citaStatus = {
    statusCita: 'Aprobada'
  }

  await tolkien.findOne({ token: cliente._doc.deviceTokens[0] }).then(async (docs) => {
    if (docs != null) {

      var payload = {
        default: 'default',
        GCM: {
          notification: {
            body: 'El trabador ' + worker._doc.name + ' confirmo que sí aceptó tu cita',
            title: 'Estado de cita',
            sound: 'default',
          }
        }
      }
      payload.GCM = JSON.stringify(payload.GCM);
      payload = JSON.stringify(payload);


    }
  });


  await citaModel.findByIdAndUpdate(idCita, {$set : citaStatus});
  

  const actualWorker = await workerModel.findById(datosDeCita._doc.recibidaPor)
  const actualUser = await usuario.findById(actualWorker._doc.id)
  const listaDeCitas = JSON.parse(JSON.stringify(actualUser.citas))
  let citasDelUsuario = []
  let contador = 0
  for (let cita of listaDeCitas) {
    const citaDelUsuario = await citaModel.findById(cita)
    citasDelUsuario.push(citaDelUsuario)
    contador++
    if (contador == listaDeCitas.length) {
      return res.status(200).json(citasDelUsuario)
    }
  }
  if(listaDeCitas.length == 0){
    return res.status(200).json(citasDelUsuario)
  }
  

  }else if (status == 'NoAprobada') {

    //Llamar el metodo de eliminar cita para borrarla si no es aceptada
    try {
      
      const tr1 = await mongoose.startSession()
      //La transacción 1 borra la cita en el documento del negocio
      tr1.startTransaction()
  
      const citaNegocio = await businessModel.find({ citas: { $in: idCita } })
  
      for await (const cit of citaNegocio) {
        const citaBusiness = cit.citas
  
        item9 = JSON.parse(JSON.stringify(citaBusiness))
  
        const index = item9.findIndex((citass) => citass == idCita)
  
        if (index !== -1) {
          item9.splice(index, 1)
        }
  
        cit.citas = item9
        await cit.save(tr1)
      }
      await tr1.commitTransaction()
  
      //La transacción 2 borra la cita en el documento del trabajador
      const tr2 = await mongoose.startSession()
      tr2.startTransaction()
  
      const citaWorker = await workerModel.find({ citasHechas: { $in: idCita } })
  
      for await (const citW of citaWorker) {
        const citaTrabajador = citW._doc.citasHechas


        //Tomar el horario y borrarlo de la agenda
        
        const fechaABuscar = `${datosDeCita._doc.citaHorario.dia}/${datosDeCita._doc.citaHorario.mes}/${datosDeCita._doc.citaHorario.year}`;

        let horarioAModificar = citW._doc.horarioDisponible;

        delete horarioAModificar['diasConCitas'][fechaABuscar][idCita];

        //Modificar worker
        await workerModel.findByIdAndUpdate(citW._id, { $set: {horarioDisponible:horarioAModificar} });


        item10 = JSON.parse(JSON.stringify(citaTrabajador))
  
        const indexW = item10.findIndex((citW) => citW == idCita)
  
        if (indexW !== -1) {
          item10.splice(indexW, 1)
        }
  
        citW.citasHechas = item10
  
        await citW.save()
      }
  
      await tr2.commitTransaction();


      //La transacción 3 borra la cita en el documento del usuario
      const tr3 = await mongoose.startSession()
      tr3.startTransaction()
  
      const citaUser = await usuario.find({ citas: { $in: idCita } })
  
      for await (const citU of citaUser) {
        const citaUsuario = citU._doc.citas
  
        item11 = JSON.parse(JSON.stringify(citaUsuario))
  
        const index3 = item11.findIndex((citUs) => citUs == idCita)
  
        if (index3 !== -1) {
          item11.splice(index3, 1)
        }
  
        citU.citas = item11
  
        await citU.save()
      }
  
      await tr3.commitTransaction();
  
     
       
      //Esta línea borra la cita del documento de las citas
      await citaModel.findByIdAndDelete(idCita)




      const actualWorker = await workerModel.findById(datosDeCita._doc.recibidaPor)
      const actualUser = await usuario.findById(actualWorker._doc.id)
      const listaDeCitas = JSON.parse(JSON.stringify(actualUser.citas))
      let citasDelUsuario = []
      let contador = 0
      for (let cita of listaDeCitas) {
        const citaDelUsuario = await citaModel.findById(cita)
        citasDelUsuario.push(citaDelUsuario)
        contador++
        if (contador == listaDeCitas.length) {
          return res.status(200).json(citasDelUsuario)
        }
      }
      if(listaDeCitas.length == 0){
        return res.status(200).json(citasDelUsuario)
      }

      return res.status(200).json({ message: 'TodoOk' })
    } catch (e) {
      return res.status(404).json({ message: 'No se puede borrar la cita' })
    }

  }

  

}

async function updateCita(req, res) {
  let citaId = req.body.idCita
  contadorDeUpdateCita++;
  console.log('updateCita' + contadorDeUpdateCita);
  const citaUpdate = {
    //Comentar acerca de que pasaria si un usuario quiere escoger otro worker
    //Re hacer el metodo con la agenda
    fecha: req.body.fecha,
    hora: req.body.hora,
    servicios: req.body.servicios,
  }

  await citaModel.findByIdAndUpdate(citaId, { $set: citaUpdate }, (err, citaUpdate) => {
    if (err) {
      return res.status(404).json('Error')
    }

    return res.status(200).json({ citaModel: citaUpdate })
  })
}



module.exports = {
  deleteCita,
  updateCita,
  postCita,
  getCita,
  verifyCita
}
