const {handleHttpError} = require('../../utils/handleError');
const { verifyToken } = require('../../utils/handleJwt');
const usuario = require('../../models/users.model');



const authMiddleWare = async (req, res, next) => {

     try {
        console.log( `intentando ${req.headers.authorization}`);
        if(!req.headers.authorization){
          return handleHttpError(res, "NO TOKEN", 401 );
          
        }
        /*
        const token = req.headers.authorization.split(' ')[1];
         console.log(token);*/

         const token = req.headers.authorization;
        const dataToken = await verifyToken(token);
           console.log(dataToken);
        if(!dataToken._id){
        return handleHttpError(res, "ERROR ID TOKEN");
         
        }
        
        const userFound = await usuario.findById({_id:dataToken._id});
        req.user = userFound;
        
        next();
 
      
    } catch (error) {
       console.log(error);
       handleHttpError(res, "ERROR IN SESSION");
    }
 }
 

module.exports ={authMiddleWare};