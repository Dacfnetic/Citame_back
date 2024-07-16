const sharp = require('sharp');
const {handleHttpError} = require('../utils/handleError')
const fs = require('fs');
const MEDIAPATH = `${__dirname}/../storage`


const resizeImage = async (req,res,next ) =>{
   
     try {
      const{file} = req;
      const resizedFileName = `resize-${Date.now()}.webp`;
      const resizedFilePath =`${__dirname}/../storageResized/${resizedFileName}`;
        
      await sharp(file.buffer)
            .webp()
            .resize(300) 
            .toFile(resizedFilePath);

        req.file.filename = resizedFileName;
        
       
        

        next();



     } catch (error) {
        console.log(error);
        handleHttpError(res, 'error to resize');
     }
   
  
  
  }
  
module.exports = {resizeImage}
  

