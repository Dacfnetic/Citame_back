const multer = require('multer')
const sharp = require('sharp')

const almacenamiento = multer.memoryStorage()
const upload = multer({
  storage: almacenamiento,
})

module.exports = upload
