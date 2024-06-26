const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')

//Datos que se guardan en la BD
const servicesSchema = new Schema({
  nombreServicio: { type: String },
  businessCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'business', required: true },
  precio: { type: Number },
  imgPath: [{ type: Schema.Types.ObjectId, ref: 'Imagen' }],
  descripcion: { type: String },
  duracion: { type: String },
  time: { type: Number },
})

module.exports = model('services', servicesSchema)
