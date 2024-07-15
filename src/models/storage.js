const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema(
    {
       
        url: {
            type:String
              },
          filename:{
           type:String
             },
       
    },

    {
     timestamps: true //este nos sirve para registrar fechas de createdAt y updateAt
    }


);

module.exports = mongoose.model('storage', storageSchema);


