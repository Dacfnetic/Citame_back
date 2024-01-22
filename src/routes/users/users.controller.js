//Importación de modelos de objetos
const usuario = require('../../models/users.model.js');
const business = require('../../models/business.model.js');
const citame = require('../../models/cita.model.js');
const jwt = require('jsonwebtoken');
const config = require('../../config/configjson.js');
//Función para obtener usuario
async function getUser(req,res){
    try{

        const token = req.headers['x-access-token'];//Buscar en los headers que me tienes que mandar, se tiene que llamar asi para que la reciba aca

        if(!token){
            return res.status(401).json({
                auth: false,
                message: 'No token'
            });
        }
        //Una vez exista el JWT lo decodifica
        const decoded =  jwt.verify(token,config.jwtSecret);//Verifico en base al token
    
        const actualUser = await usuario.findById(decoded.idUser);
        const listaDeCitas = JSON.parse(JSON.stringify(actualUser.citas));
        let citasDelUsuario = [];
        let contador = 0;
        for(let cita of listaDeCitas){
            const citaDelUsuario = await citame.findById(cita);
            citasDelUsuario.push(citaDelUsuario);
            contador++;
            if(contador == listaDeCitas.length){
                res.status(200).json(citasDelUsuario);
            }
        }

    }catch(e){
        return res.status(404).json('Errorsillo');
    }  
}
async function getAllUser(req,res){
    try{
        const allUsers = await usuario.find();
        const allActiveUsers = allUsers.filter((nUser)=>nUser.googleId!=req.get('googleId'));
        return res.status(200).json( allActiveUsers );
    }catch(e){
        return res.status(404).json('Errorsillo');
    }  
}
//Función para crear usuario
async function postUser(req,res){
    try{
        usuario.findOne({emailUser: req.body.emailUser})
        .then(async (docs)=>{
            if(docs == null){
                console.log('Creando usuario');

                const usuarioSave = await usuario({
                    googleId: req.body.googleId,
                    userName: req.body.userName,
                    emailUser: req.body.emailUser,
                    avatar: req.body.avatar,
                });

                usuarioSave.save();

                const token = jwt.sign({idUser: usuarioSave._id},config.jwtSecret,{//Obtenemos y guardamos el id del usuario con su token
                    algorithm: 'HS256',
                    expiresIn: 60 * 60 * 24 * 7   //Expira en 1 dia
                })

                return res.status(201).json({auth: true, token});

            }else{

                const usuarioSave = await usuario.findOne({emailUser: req.body.emailUser});

                const token = jwt.sign({idUser: usuarioSave._id},config.jwtSecret,{//Obtenemos y guardamos el id del usuario con su token
                    algorithm: 'HS256',
                    expiresIn: 60 * 60 * 24 * 7   //Expira en 1 dia
                })

                return res.status(201).json({auth: true, token});

            }
            
        })
    }catch(e){
        return res.status(404).json('Errosillo');
    }  
}


async function updateUser(req,res){

    let emailUsuario = req.body.emailUser

    const usuarioUpdate = {
        userName: req.body.userName
    }

    await usuario.findOneAndUpdate(emailUsuario,{$set:usuarioUpdate},(err,userUpdated)=>{

        if(err){return res.status(404).json('Errosillo');}

        return res.status(200).json({usuario: userUpdated});
    })

}


async function FavoriteBusiness(req,res){

    const token = req.headers['x-access-token'];//Buscar en los headers que me tienes que mandar, se tiene que llamar asi para que la reciba aca

    if(!token){
        return res.status(401).json({
            auth: false,
            message: 'No token'
        });
    }
    //Una vez exista el JWT lo decodifica
    const decoded =  jwt.verify(token,config.jwtSecret);//Verifico en base al token

 
        let item = [];
        let previousBusiness  = '';
    

        await usuario.findById(decoded.idUser)
        .then((docs)=>{

            previousBusiness = docs.favoriteBusiness;

        });
        let modelo = '';
        await business.findById(req.body.idBusiness).then((docs)=>{
            modelo = docs._doc;
        });
        modelo = JSON.parse(JSON.stringify(modelo));
        item = JSON.parse(JSON.stringify(previousBusiness));

       /* const mapOfIds = item.map((este)=>{
            return este._id;
        })*/

        const index = item.indexOf(modelo._id);
        if(index != -1){
            if(item.length == 1){
                item = [];
            }else{
                item.splice(index,1);
            }
            
        }else{
            const nuevoModeloBien = await business.findById(req.body.idBusiness);
            item.push(nuevoModeloBien._id);
        }
        

        const mod = {favoriteBusiness: item};

        await usuario.findByIdAndUpdate(decoded.idUser, {$set: mod});


        return res.status(200).send('Nitido');
    

}

async function deleteFavBusiness(req,res){

    

}





//Exportar funciones
module.exports = {
    getUser,
    postUser,
    getAllUser,
    updateUser,
    FavoriteBusiness
}