const S3 = require('@aws-sdk/client-s3')
const configuracion = require('./config')
const fs = require('fs')

const client = new S3.S3Client({
    region: configuracion.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: configuracion.AWS_ACCESS_KEY,
        secretAccessKey: configuracion.AWS_SECRET_ACCESS_KEY
    }
})

async function uploadFile(file, nombre){
    const stream = fs.createReadStream(file)
    const uploadParams = {
        Bucket: configuracion.AWS_BUCKET_NAME,
        Key: nombre,
        Body: stream
    }
    const command = new S3.PutObjectCommand(uploadParams);

    const result = await client.send(command);
    console.log(result);
    return result.ETag;
}

module.exports = {
    uploadFile
  }

