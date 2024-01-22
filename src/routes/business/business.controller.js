//Importación de modelos de objetos
const usuario = require('../../models/users.model.js');
const business = require('../../models/business.model.js');
const services = require('../../models/services.model.js');
const workerModel = require('../../models/worker.model.js');
const citaModel = require('../../models/cita.model.js');
const jwt = require('jsonwebtoken');
const Imagen = require('../../models/image.model.js');
const mongoose = require('mongoose');
const config = require('../../config/configjson.js');
const {deleteImagesOnArrayService,deleteImagesOnArrayWorkers,deleteImagen} = require('../../config/functions.js')
const io = require('../../../server.js');

async function getAllBusiness(req,res){
    console.log('Intentando obtener negocios por categoria');
    try{
        usuario.findOne({emailUser: req.get('email')})
            .then(async(docs)=>{
                if(docs.emailUser == req.get('email')){
                    const allBusiness = await business.find({category: req.get('category')});
                    return res.status(200).json(allBusiness);
                }
            }).catch(e=>console.log(e));
    }catch(e){
        return res.status(404).json('Errosillo');
    }  
}

async function getAllBusinessd(req,res){
    const nombreNegocio = req.body.businessName;
    const categoriaNegocio = req.body.category;
    const skip = 0;
    const limit = 2; //Modificable

    const negocios = await business.find({


        $or: [

            {businessName: {$regex: nombreNegocio, $options: "i"}},
            {category: {$regex: categoriaNegocio, $options: "i"}},

        ],
        
    }).projection({ businessName: 1,category: 1,}).skip(skip).limit(limit);

    res.status(200).json(negocios);

}


async function getOwnerBusiness(req,res){
    
    try{

        console.log('Intentando obtener negocios del usuario');
        usuario.findOne({emailUser: req.get('email')})
            .then(async(docs)=>{
                if(docs.emailUser == req.get('email')){
                    const ownerBusiness = await business.find({ createdBy: docs._id });
                    console.log('Ya tenemos la lista de negocios del usuario');
                    const comprob =req.get('estado');
                    if(comprob=='1'){
                        console.log('Como no habian cambios no te enviamos nada');
                        return res.status(200).send('1');
                    }
                    console.log('Ahora te vamos a enviar los negocios del usuario, luego te envio las imagenes');
                    return res.status(201).json(ownerBusiness);
                }
            }).catch(e=>console.log(e));
    }catch(e){
        return res.status(404).json('Errosillo');
    }  
}
async function verifyOwnerBusiness(req,res){
    console.log('Verificando si los negocios del usuario han cambiado');
    try{
        usuario.findOne({emailUser: req.body.email})
            .then(async(docs)=>{
                if(docs.emailUser == req.body.email){
                    const ownerBusiness = await business.find({ createdBy: docs._id });
                    if(ownerBusiness.length != 0){
                        listaDeNombres = ownerBusiness.map((busi)=> busi.businessName);
                        listaDeNombresOrdenada = listaDeNombres.sort(function(a, b){return b - a});
                        nombresRecibidos = req.body.businessName;
                        listaRecibidaOrdenada = nombresRecibidos.sort(function(a, b){return b - a});
                        if(JSON.stringify(listaRecibidaOrdenada)===JSON.stringify(listaDeNombresOrdenada)){
                            return res.status(201).send('1');
                        }
                    }
                    return res.status(201).send('0');
                }
            }).catch(e=>console.log(e));
    }catch(e){
        return res.status(404).json('Errosillo');
    }  
}
async function postBusiness(req,res){
    console.log('Intentando crear negocio');
    try{
        let existe = true;    
        await business.findOne({businessName: req.body.businessName, email: req.body.email, workers:req.body.workers})
            .then((docs) => {
                if(docs == null){
                    existe = false
        }});
        if(existe) return res.status(202).send('El negocio ya existe');
        await usuario.findOne({emailUser: req.body.email})
            .then(async (docs)=>{

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
                    servicios: req.body.servicios
                });
                await nuevo.save();
                return res.status(201).json(nuevo);
        });
    }catch(e){
        console.log(e);
        return res.status(404).json('Errosillo');
    }  
}
async function deleteBusiness(req,res){
    console.log('Intentando borrar negocio');
    try{

 

        let existe = true;   
        
        //Eliminar la imagen en el sistema de archivos y el modelo

        let previaImagen = '';
        let previousWorker = '';
        let previousCita = '';
        let previousWorkerImage = '';
        let previousService = '';
        let previousServiceImage = '';
        let previousFav = '';

        await business.findById(req.body.businessId)
        .then((docs)=>{
            previaImagen = docs.imgPath;
        });

        item = JSON.parse(JSON.stringify(previaImagen));

        deleteImagen(item);

        //---Eliminar Workers del array y modelo---

        await business.findById(req.body.businessId)
        .then((docs)=>{
            previousWorker = docs.workers;
        });

        item2 = JSON.parse(JSON.stringify(previousWorker));

        
        deleteImagesOnArrayWorkers(item2);

        
        const trabajador = await workerModel.find({ _id: { $in: item2 } });

        await workerModel.deleteMany({_id: { $in: trabajador.map( (worker) => worker._id )} })


        //---Eliminar los servicios del array y Modelo---

        await business.findById(req.body.businessId)
        .then((docs)=>{
            previousService = docs.servicios;
        });

        item3 = JSON.parse(JSON.stringify(previousService));

        deleteImagesOnArrayService(item3);
        
        const servicioInArray = await services.find({ _id: { $in: item3 } });

        await services.deleteMany( { _id: { $in: servicioInArray.map( (servicio) => servicio._id ) } } )
        
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

        await business.findById(req.body.businessId)
        .then((docs)=>{
            previousCita = docs.citas;
        });

        arrayCitas = JSON.parse(JSON.stringify(previousCita));
        const citasB = await citaModel.find({ _id: { $in: arrayCitas } });

        await citaModel.deleteMany({_id: { $in: citasB.map( (citaD) => citaD._id )} })

        
        const tr3 = await mongoose.startSession();
        tr3.startTransaction();

        const citaUser = await usuario.find({citas: {$in: idCita}});

        for await (const citU of citaUser){

            const citaUsuario = citU.citas;

            item11 = JSON.parse(JSON.stringify(citaUsuario));

            const index3 = item11.findIndex((citUs) => citUs == idCita);

            if(index3 !== -1){
                item11.splice(index3,1);

            }

            citU.citas = item11;

            await citU.save();

        }

        await tr3.commitTransaction();


        
        //Borrar el modelo entero de favouriteBusiness en el array del usuario

        const idnegocio = req.body.businessId;
        const tr = await mongoose.startSession();
        tr.startTransaction();
        
        const usuarioWithFav = await usuario.find({ favoriteBusiness: { $in: idnegocio } })

        for await ( const fav of usuarioWithFav ){

            const negocioFav = fav.favoriteBusiness;

            item6 = JSON.parse(JSON.stringify(negocioFav));

            const index = item6.findIndex(( negocio )=> negocio === idnegocio);

            if(index !== -1){
                item6.splice(index,1);
            }

            fav.favoriteBusiness = item6;

            //Actualiza el documento del usuario
            await fav.save(tr)

        }

        await tr.commitTransaction();

        
       //Borrar las citas del array del usuario

       const businessF = await business.findById(req.body.businessId);
       const user = await usuario.findOne({_id: req.body.idUser});
       const Citas = businessF.citas;//Obtengo las citas de ese negocio

       Citas.pull(Citas.filter((cita)=> cita._id === Citas._id));
       await user.updateOne({_id: user._id}, {citas: Citas});
       
        
        await business.findByIdAndDelete(req.body.businessId)//Cambiar y recibir el ID

        return res.status(200).json({message: 'Todo ok'});
       
        

    }catch(e){
        console.log(e);
        return res.status(404).json('Errosillo');
    }  
}
async function updateWorkersInBusinessbyCreateWorker(req,res){
    console.log('Actualizando fotos del usuario');
    try {
  
        let previousWorkers = '';
      
        await business.findById(req.body.businessId)
            .then((docs) => {
                previousWorkers = docs.workers;
        });
        item = JSON.parse(JSON.stringify(previousWorkers));
        item.push(req.body.workerId);
        const modificaciones = {workers: item};
        let resultado = await business.findByIdAndUpdate(req.body.businessId,{$set:modificaciones});
        res.status(200).json({message: 'Negocio Actualizado'});

        
    } catch (error) {
        res.status(500).json({error: error.message});
    };


}

async function updateWorkers(req,res){
    console.log('Actualizando trabajadores del usuario');
    let item = [];
    let previousWorkers = '';
      
        await business.findById(req.body.idBusiness)
            .then((docs) => {
                previousWorkers = docs.workers;
        
        });
         item = JSON.parse(JSON.stringify(previousWorkers));

        const filtro = req.body.idWorker;
        const setWorker = new Set(item);
        setWorker.delete(filtro);
        const arrayWorker = Array.from(setWorker);

        const modificaciones = {workers: arrayWorker};
        //console.log('Si prro');
        let resultado = await business.findByIdAndUpdate(req.body.idBusiness,{$set:modificaciones});
        console.log(resultado);
        return res.status(200).send('Todo ok');
}

async function updateArrayServices(req,res){
    let item = [];

   let previousService = '';


   await business.findById(req.body.idBusiness)
   .then((docs) => {

       previousService = docs.servicios;
       
       
   });

    item = JSON.parse(JSON.stringify(previousService));
    item.push(req.body.idService);

  
    const modificaciones = {servicios: item}

    let resultado = await business.findByIdAndUpdate(req.body.idBusiness,{$set: modificaciones});

    console.log(resultado);
    return res.status(200).send('Todo Ok');

}

async function updateBusiness(req,res){

    let businessId = req.body.idBusiness;

    const modificaciones = {
        businessName: req.body.businessName,
        category: req.body.category,
        email: req.body.email,
        contactNumber: req.body.contactNumber,
        direction: req.body.direction,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        description: req.body.description,
        horario: req.body.horario}

    await business.findByIdAndUpdate(businessId,{$set:modificaciones},(err,negocioUpdated)=>{
        
        if(err) {return res.status(404).json('Errosillo');}

        
        return res.status(200).json({business: negocioUpdated});

    })



}

async function getFavBusiness(req,res){

    const token = req.headers['x-access-token'];//Buscar en los headers que me tienes que mandar, se tiene que llamar asi para que la reciba aca

    if(!token){
        return res.status(401).json({
            auth: false,
            message: 'No token'
        });
    }
    //Una vez exista el JWT lo decodifica
    const decoded =  jwt.verify(token,config.jwtSecret);//Verifico en base al token


    await usuario.findById(decoded.idUser)
    .then(async(docs)=>{
        const negociosFavoritos = docs.favoriteBusiness;
        const negocios = await Promise.all(negociosFavoritos.map( async (negocio)=> business.findById(negocio) ));
        return res.status(200).json(negocios);
        
    });

}

async function updateImage(req,res){

}

async function updateBusinessSchedule(req,res){
    console.log('Actualizando horario del negocio');
    const modificaciones = {horario: JSON.stringify(req.body.horario)};
    //console.log('Si prro');
    let resultado = await business.findByIdAndUpdate(req.body.idBusiness,{$set:modificaciones});
    return res.status(200).send('Todo ok');
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
}


