const usuario = require('../../models/users.model.js')
const business = require('../../models/business.model.js')
const citame = require('../../models/cita.model.js')
const {handleHttpError}= require('../../utils/handleError.js');
var AWS = require('aws-sdk')
const config = require('../../config/configjson.js');
const {tokenSign} = require('../../utils/handleJwt.js')
const { JSONType } = require('@aws-sdk/client-s3')
var contadorDeGetUser = 0;
var contadorDePostUser = 0;
var contadorDeToggleFavoriteBusiness = 0;

const getUser = async (req, res) =>{
  contadorDeGetUser++;
  console.log('getUsers: ' + contadorDeGetUser);
  try {
    const {user} = req; 
    const {citas} = user;
    const listaDeCitas = JSON.parse(JSON.stringify(user.citas))
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
const postUser = async(req, res)=> {
  
  contadorDePostUser++;
  console.log('PostUser: ' + contadorDePostUser);
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

          //lookup de los negocios
        
          res.status(200).send(userWithToken);        
          
          }
 }

  catch (error) {
        console.log(error )
        handleHttpError(res, "ERROR AL CREAR USUARIO", 404);  
  
  }
}
const toggleFavoriteBusiness = async(req, res) => {
 try {
  let contador = 0;
  const negocio =await business.findById(req.body.idBusiness);
  console.log(negocio);
 
  contadorDeToggleFavoriteBusiness++;
  console.log('FavoriteBusiness: ' + contadorDeToggleFavoriteBusiness);
  let item = []
  
  const {user} = req; 
   
  const {body} = req;
  item = JSON.parse(JSON.stringify(user.favoriteBusinessIds))
  
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

if(contador == 0){
  item.push(body.idBusiness);
}

  console.log(contador);
  const mod = { favoriteBusinessIds: item};
  
  const usuarioResult = await usuario.findByIdAndUpdate(user.id, { $set: mod })

res.status(200).send(usuarioResult);


 } catch (error) {
   handleHttpError(res, "error to add favorite")
   console.log(error);
 }  

}
module.exports = { getUser, postUser, toggleFavoriteBusiness }