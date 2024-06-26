const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')

//Datos que se guardan en la BD
const deviceTokenSchema = new Schema({
  token: { type: String, required: true },
  arn: { type: String, required: true },
})

module.exports = model('deviceToken', deviceTokenSchema)
