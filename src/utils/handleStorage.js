const multer = require('multer');
const sharp = require('sharp');

const storage = multer.diskStorage({
    //esta funcion es para saber donde se va a guardar el archivo recibido
    destination:function(req, file, callback){
     sharp()   
     const pathStorage = `${__dirname}/../storage`;
     callback(null, pathStorage);
    },

    filename: function(req, file, callback){
        const extension = file.originalname.split(".").pop();
        const filename = `file-${Date.now()}.${extension}`;
        callback(null, filename);





        
    }
});







//uso de middleware para multer

const uploadMiddleware = multer({
    storage
})

module.exports = {uploadMiddleware};