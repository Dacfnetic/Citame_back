const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')
const business = require('./business.model')

//Datos que se guardan en la BD
const userSchema = new Schema({
  googleId: { type: String, required: true },
  userName: { type: String, required: true },
  emailUser: { type: String, required: true, unique: true },
  avatar: { type: String, required: true },
  deviceTokens: [{ type: String, required: true }],
  //favoriteBusiness:[{type: mongoose.Schema.Types.Mixed}],
  favoriteBusiness: [{ type: Schema.Types.ObjectId, ref: 'business' }],
  citas: [{ type: Schema.Types.ObjectId, ref: 'cita' }],
  //status:{type:Boolean},
  //bussinessAsOwner: [String],
  //bussinessAsEmployer: [String]
})

module.exports = model('usuario', userSchema)
