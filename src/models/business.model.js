const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')

const businessSchema = new Schema({
  businessName: { type: String, required: true },
  category: { type: String, required: true },
  citas: [{type: mongoose.Schema.Types.Mixed}],
  contactNumber: { type: String, required: true },
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario', required: true},
  description: { type: String, required: true },
  direction: { type: String, required: true },
  email: { type: String, required: true },
  horario: { type: String },
  imgPath :{type: String, required: true},
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  servicios: {type: mongoose.Schema.Types.Mixed},
  workers: {type: mongoose.Schema.Types.Mixed},
})

module.exports = model('business', businessSchema)