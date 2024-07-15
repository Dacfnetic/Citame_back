const sharp = require('sharp');
const PUBLIC_URL = process.env.PUBLIC_URL;
const {handleHttpError} = require('../utils/handleError')

const resizeImage = async (req,res,next ) =>{
   
     try {
        const{file} = req;
        

        const resizedFileName = `resize-${file.filename.split('.').slice(0, -1).join('.')}.webp`;
        const resizedFilePath = path.join(__dirname, '/../storageResized', resizedFileName);

        await sharp(file.path)
            .resize(300) // Cambia el tamaño según tus necesidades
            .toFile(resizedFilePath);

        // Actualiza req.file con la información de la imagen redimensionada
        req.file.filename = resizedFileName;
        req.file.path = resizedFilePath;
        req.file.url = `${PUBLIC_URL}/storageResized/${resizedFileName}`;

        // Opcional: Eliminar la imagen original si no es necesaria
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error('Error deleting the original file:', err);
            }
        });

        next();



     } catch (error) {
        handleHttpError(res, 'erro to resize');
     }
   
  
  
  }
  
module.exports = {resizeImage}
  

