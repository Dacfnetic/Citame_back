const {Schema, model} = require('mongoose');
const mongoose = require('mongoose');

const imageSchema = new Schema({

    imgNombre: {type: String},
    imgRuta:{type:String}

});

module.exports = model('Imagen',imageSchema);