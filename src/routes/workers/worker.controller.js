//Importación de modelos de objetos
const usuario = require('../../models/users.model.js');
const business = require('../../models/business.model.js');
const workersModel = require('../../models/worker.model.js');
const Agenda = require('../../models/agenda.js');


async function postWorkers(req,res){
    try{       
        let existe = true;
        let worker = [];  
        await business.findById(req.body.id)
            .then((docs) => {
                if(docs != null){
                    worker = JSON.parse(JSON.stringify(docs.workers)); //id mongo 
        }});
        let contador = 0;

        if(worker.length == 0){
            await usuario.findOne({emailUser: req.body.email})
                .then(async (docs)=>{
                    if(docs != null){
                        console.log('Creando Trabajador');
                        const horasQueVaATrabajarElEsclavo = new Agenda();
                        horasQueVaATrabajarElEsclavo.construirHorarioInicial(req.body.horario);

                        const nuevo = new workersModel({
                            id: docs._id,
                            workwith: req.body.id,
                            name: req.body.name,
                            email: req.body.email,
                            salary: req.body.salary,
                            //horario: req.body.horario,
                            horarioDisponible: horasQueVaATrabajarElEsclavo,
                            status: req.body.status,
                            puesto: req.body.puesto,
                            celular: req.body.celular,

                        });
                        await nuevo.save();
                        console.log('No hay error');
                        return res.status(201).json(nuevo);    
                    }
                return res.status(202).send('Correo no registrado');
            });
        }

        if(worker.length != 0){
            await worker.forEach(async (e)=> {
                await workersModel.findOne({_id : e}).then(async (docs) =>{
                    if(docs.email == req.body.email){
                        return res.status(203).send('El trabajador ya esta en el negocio');
                    }
                    contador += 1;
                    if(contador == worker.length){
                        await usuario.findOne({emailUser: req.body.email})
                        .then(async (docs)=>{
                            if(docs != null){
                                console.log('Creando Trabajador');
                                const horasQueVaATrabajarElEsclavo = new Agenda();
                                horasQueVaATrabajarElEsclavo.construirHorarioInicial(req.body.horario);
                                const nuevo = new workersModel({
                                    id: docs._id,
                                    workwith: req.body.id,
                                    name: req.body.name,
                                    email: req.body.email,
                                    salary: req.body.salary,
                                    //horario: req.body.horario,
                                    horarioDisponible: horasQueVaATrabajarElEsclavo,
                                    status: req.body.status,
                                    puesto: req.body.puesto
                                });
                                await nuevo.save();
                                return res.status(201).json(nuevo); 
                }
                return res.status(202).send('Correo no registrado');
                });
    
                }
                });           
            });   
        }
                   

        
    }catch(e){
        return res.status(404).json('Error Catastrofico, no se que paso');
    }; 

};

async function getWorkers(req,res){

    try{

        let worker = [];
        await business.findById(req.get('businessId'))
        .then((docs) => {
            if(docs != null){
                worker = JSON.parse(JSON.stringify(docs.workers)); //id mongo 
                if(worker.length == 0){
                    return res.status(201).send('No hay trabajadores');
                }
            }else{
                //Implementar respuesta en front y back de que no se encontro el negocio
            }
            
        });

        
        let trabajadores = []
        let contador = 0;

        worker.forEach(async (e)=> {

            const trabajador = await workersModel.findOne({_id : e});

            trabajadores.push(trabajador);

            contador += 1;
            if(contador == worker.length){
                return res.status(200).json(trabajadores);
            }

    
        });
                            


    }catch(e){

        return res.status(404).json('Errorsillo');

    }

};


async function deleteWorkers(req,res){
     try {
        
        
         //Borrar modelo
         await workersModel.findByIdAndDelete(req.body.idWorker);
         return res.status(200).json({message: 'Todo ok'});


     } catch (e) {
         return res.status(404).json('Error Catastrofico, no se que paso');
     }
};

async function updateHorarioWorker(req,res){
    
}

async function updateStatusCita(req,res){

    let citaId = req.body.idCita;

    const citaUpdate = {
        
        estado: req.body.estado

    }
    
    await citaModel.findByIdAndUpdate(citaId, {$set: citaUpdate}, (err,citaUpdate)=>{

        if(err){
            return res.status(404).json('Error');
        }

        return res.status(200).json({citaModel: citaUpdate})

    });


}


module.exports  = {

    getWorkers,
    postWorkers,
    deleteWorkers,
    updateStatusCita
}
