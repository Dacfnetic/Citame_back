//Importación de modelos de objetos
const usuario = require('../../models/users.model.js')
const tolkien = require('../../models/deviceToken.model.js')
const business = require('../../models/business.model.js')

const citame = require('../../models/cita.model.js')
const jwt = require('jsonwebtoken')
const {handleHttpError}= require('../../utils/handleError.js');
var AWS = require('aws-sdk')
const config = require('../../config/configjson.js');
const {tokenSign} = require('../../utils/handleJwt.js')
const { JSONType } = require('@aws-sdk/client-s3')
var contadorDeGetUser = 0;
var contadorDePostUser = 0;
var contadorDeGetAllUsers = 0;
var contadorDeUpdateUser = 0;
var contadorDeFavoriteBusiness = 0;
//Función para obtener usuario


async function getUser(req, res) {
  contadorDeGetUser++;
  console.log('getUsers: ' + contadorDeGetUser);
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

    const actualUser = await usuario.findById(decoded.idUser)
    const listaDeCitas = JSON.parse(JSON.stringify(actualUser.citas))
    let citasDelUsuario = []
    let contador = 0
    for (let cita of listaDeCitas) {
      const citaDelUsuario = await citame.findById(cita)
      citasDelUsuario.push(citaDelUsuario)
      contador++
      if (contador == listaDeCitas.length) {
        res.status(200).json(citasDelUsuario)
      }
    }
  } catch (e) {
    return res.status(404).json('Errorsillo')
  }
}
async function getAllUser(req, res) {
  contadorDeGetAllUsers++;
  console.log('GetAllUsers: ' + contadorDeGetAllUsers);
  try {
    const allUsers = await usuario.find()
    const allActiveUsers = allUsers.filter((nUser) => nUser.googleId != req.get('googleId'))
    //return res.status(200).json(allActiveUsers)
    res.status(200).send(allUsers);
  } catch (e) {
     handleHttpError(res, "error to get all users")  
  }
}



const postUser = async(req, res)=> {
  
  /* #region Borrar esto en producción */
  contadorDePostUser++; //TODO: Borrar esto en producción
  console.log('PostUser: ' + contadorDePostUser); //TODO: Borrar esto en producción
  try {
    
    const  {emailUser, googleId, userName, avatar, deviceToken} = req.body;
    const user = await usuario.findOne({ emailUser: emailUser })
      if(user == null ){

      const newUser = {
        googleId: googleId,
        emailUser: emailUser,
        userName: userName,
        avatar: avatar,
        deviceTokens: deviceToken
      }  
      const createdUser = await usuario.create(newUser);
      

      const userWithToken = {
        token: await tokenSign(createdUser),
        user: createdUser
      }
            
        res.status(201).send(userWithToken);
      }
      else{
         console.log("ya existe");
         const {deviceTokens: tokens} = user;
        
         if (!tokens.includes(deviceToken)) {
          tokens.push(deviceToken);
  
              
           }
           const userUpdated =  await usuario.findByIdAndUpdate(user._id, {
            $set: { deviceTokens: tokens }
          })
         
           const userWithToken = {
            token: await tokenSign(userUpdated),
            user: userUpdated
          }
        
          res.status(200).send(userWithToken);        
          
          }
 }

  catch (error) {
        console.log(error )
        handleHttpError(res, "ERROR AL CREAR USUARIO", 404);  
  
  }
}




async function updateUser(req, res) {
  contadorDeUpdateUser++;
  console.log('UpdateUser: ' + contadorDeUpdateUser);
  let emailUsuario = req.body.emailUser

  const usuarioUpdate = {
    userName: req.body.userName,
  }

  await usuario.findOneAndUpdate(emailUsuario, { $set: usuarioUpdate }, (err, userUpdated) => {
    if (err) {
      return res.status(404).json('Errosillo')
    }

    return res.status(200).json({ usuario: userUpdated })
  })
}




const FavoriteBusiness = async(req, res) => {
 try {
  let contador = 0;
  
   
  const negocio =await business.findById(req.body.idBusiness);
  console.log(negocio);
 
  contadorDeFavoriteBusiness++;
  console.log('FavoriteBusiness: ' + contadorDeFavoriteBusiness);
let negocios = [];  
  let item = []
  
  const {user} = req; 
   
  const {body} = req;
  item = JSON.parse(JSON.stringify(user.favoriteBusinessIds))
negocios = JSON.parse(JSON.stringify(user.favoriteBusiness));
  
  const index = item.indexOf(body.idBusiness)
  const {idBusiness} = body 
  
  item = item.filter(idNegocio =>{
    if(idBusiness != idNegocio){
        return idNegocio; 
    }
    else{
        contador ++;
    }
})

negocios = negocios.filter(negocio=>{
      if(idBusiness != negocio._id){
        return negocio;
      }        
      else{
        contador ++;
      }

      
})

if(contador == 0){
  item.push(body.idBusiness);
  negocios.push(negocio);
 
}

  console.log(contador);
  const mod = { favoriteBusinessIds: item , favoriteBusiness: negocios};
  
  const usuarioResult = await usuario.findByIdAndUpdate(user.id, { $set: mod })

  
  
res.status(200).send(usuarioResult);


 } catch (error) {
   handleHttpError(res, "error to add favorite")
   console.log(error);
 }  

}

async function deleteFavBusiness(req, res) {}

//Exportar funciones
module.exports = {
  getUser,
  postUser,
  getAllUser,
  updateUser,
  FavoriteBusiness,
}
