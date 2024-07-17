const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')

//Datos que se guardan en la BD
const businessSchema = new Schema({
  businessName: { type: String, required: true },
  category: { type: String, required: true },
  email: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usuario',
    required: true,
  },
  workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'worker'}],
  //workers: {type: mongoose.Schema.Types.Mixed},
  contactNumber: { type: String, required: true },
  direction: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  description: { type: String, required: true },
  //imgPath: [{type: Schema.Types.ObjectId, ref: 'Imagen'}],
  imgPath :{type: String, required: true},
  //imagenes: {type: mongoose.Schema.Types.Mixed},
  
 
  horario: { type: String },
  servicios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'services' }],
  citas: [{ type: Schema.Types.ObjectId, ref: 'cita' }],
})

module.exports = model('business', businessSchema)
