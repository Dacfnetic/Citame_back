const sharp = require('sharp')
const fs = require('fs')
const { randomImageName } = require('./img.controller')
const Negocio = require('../../models/business.model')
const Imagen = require('../../models/image.model')
const Trabajador = require('../../models/worker.model')

class ImageService {
  
  async uploadImage(data) {
    try {
      const bufferImg = await sharp(data.buffer.buffer).resize({ width: 300, height: 300 }).toBuffer()

      const nameImg = randomImageName()
      const nameFile = `img_${nameImg}_${Date.now()}.png`
      const rutaAlmacenamiento = `src/img_CitaMe/${nameFile}`

      await fs.writeFileSync(rutaAlmacenamiento, bufferImg)

      const imagen = new Imagen({ imgNombre: nameFile, imgRuta: rutaAlmacenamiento })
      await imagen.save()

      const id = data.id
      if (data.destiny == 'business') {
        await Negocio.findByIdAndUpdate(id, { $push: { imgPath: imagen._id } })
        return 'Imagen Subida'
      }
      if (data.destiny == 'worker') {
        await Trabajador.findByIdAndUpdate(id, { $push: { imgPath: imagen._id } })
        return 'Imagen Subida'
      }
    } catch (e) {
      console.log(e)
      throw new Error('Errosillo 404')
    }
  }
}

module.exports = ImageService
