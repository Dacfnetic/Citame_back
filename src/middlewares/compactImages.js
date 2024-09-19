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

  const resizeImages = async (req,res,next ) =>{
   
   try {
    const{files} = req;
    
    let longitud = files.imagen.length;
  
     
    for(let i = 0; i < longitud; i++){
     
      const resizedFileName = `resize-${Date.now()}.webp`;
      const resizedFilePath =`${__dirname}/../storageResized/${resizedFileName}`;

      await sharp(files.imagen[i].buffer)
      .webp()
      .resize(300) 
      .toFile(resizedFilePath);

      req.files.imagen[i].filename = resizedFileName;



    }

   
      
      
     
      

      next();



   } catch (error) {
      console.log(error);
      handleHttpError(res, 'error to resize');
   }
 


}
  
module.exports = {resizeImage, resizeImages}
  

