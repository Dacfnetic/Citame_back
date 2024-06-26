const { Schema, model } = require('mongoose')

//Datos que se guardan en la BD
const messageSchema = new Schema({
  senderId: String,
  receiverId: String,
  message: String,
  timestamp: String,
})

module.exports = model('mensaje', messageSchema)
