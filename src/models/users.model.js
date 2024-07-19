const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')
const business = require('./business.model')

//Datos que se guardan en la BD
const userSchema = new Schema(
{
  avatar: { type: String, required: true },
  citas: [{ type: Schema.Types.ObjectId, ref: 'cita' }],
  deviceTokens: [{type: String,}],
  emailUser: { type: String, required: true, unique: true },
  favoriteBusinessIds: [{type: Schema.Types.ObjectId, ref: 'business'}],
  googleId: { type: String, required: true },
  ownerBusinessIds: [{type: Schema.Types.ObjectId, ref: 'business'}],
  userName: { type: String, required: true },
}, 
{
  timestamps: true
});

module.exports = model('usuario', userSchema)