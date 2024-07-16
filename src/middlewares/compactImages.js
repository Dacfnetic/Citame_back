const sharp = require('sharp');
const {handleHttpError} = require('../utils/handleError')
const fs = require('fs');
const MEDIAPATH = `${__dirname}/../storage`


const resizeImage = async (req,res,next ) =>{
   
     try {
        const{file} = req;
        const filenameOld = file.filename;    
        console.log(file);
        const resizedFileName = `resize-${file.filename.split('.').slice(0, -1).join('.')}.webp`;
        const resizedFilePath =`${__dirname}/../storageResized/${resizedFileName}`;
         
        await sharp(file.path)
            .webp()
            .resize(300) 
            .toFile(resizedFilePath);

        req.file.filename = resizedFileName;
        req.file.path = resizedFilePath;
        const oldpath = `${MEDIAPATH}/${filenameOld}`;
        const files = await fs.readdir(oldpath, (error)=>{
         if(error){
            console.log(error);
         }
        });
        
       
        

        next();



     } catch (error) {
        console.log(error);
        handleHttpError(res, 'error to resize');
     }
   
  
  
  }
  
module.exports = {resizeImage}
  

