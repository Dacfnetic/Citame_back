const http = require('http')
const app = require('./src/app')
const { Server } = require('socket.io')
const user = require('./src/models/users.model')
const { deleteBusiness } = require('./src/routes/business/business.controller')
var AWS = require('aws-sdk')
var uuid = require('uuid')


const { connect } = require('./src/config/database')
const { setTimeout } = require('timers')
//const {setupWebSocket} = require('./src/routes/notification/notification.controller');

const server = http.createServer(app)
const io = new Server(server)
const PORT = process.env.PORT || 4000
const usuariosConectados = new Set()
const listaDeSocketConCorreo = {}
const arrayNegocios = []
let gets = 0;
async function update() {
  await io.emit('CACA', 'CACA')
  setTimeout(update, 5000)
}


async function main(){
    
    //Conexion a la BD
    await connect();

    
    app.get('/', (req, res) => {
        res.send('Holis');
      }); 
      //Usuarios conectados
      let contador = 0;
    io.on('connection', (socket) => {
        //io.disconnectSockets(true);
        console.log('a user connected' + socket.id);
        
        socket.on('UsuarioRegistrado',(emailUser) => {  
            contador++;
            console.log(contador);       
            if(usuariosConectados.has(emailUser)){
                listaDeSocketConCorreo[emailUser] = socket.id;
                socket.emit('Usuario encontrado');
                console.log(usuariosConectados);
            }else{
                usuariosConectados.add(emailUser);
                //Mandar los usuarios
                io.emit('Usuarios Actualizados', Array.from(usuariosConectados));

                listaDeSocketConCorreo[emailUser] = socket.id;
                console.log(usuariosConectados);
                console.log(listaDeSocketConCorreo);
            } 

            //update();

        });

        //Refresh para el delete business.
        
        socket.on('deleteBusiness', (id) => {
            console.log(usuariosConectados);
            console.log(socket.client.sockets);
            console.log('NEGOCIOo');
            //Eliminar el negocio de la lista
            //arrayNegocios = arrayNegocios.filter( (n) => n.id !== id );

            //socket.broadcast.emit('negocioEliminado',id);
            io.emit('negocioEliminado',id);

        });

        socket.on('citaEmitida', (correoAEnviarNotificacion) => {
          
            io.to(listaDeSocketConCorreo[correoAEnviarNotificacion]).emit('solicitudEntrante','El usuario x quiere reserva una cita con vos'); 
            //socket.broadcast.emit('negocioEliminado',id);
           

        });
  
        //Desconexion de usuarios
        socket.on('disconnect',()=>{
            console.log('usuario desconectado');
            usuariosConectados.delete(socket.emailUser);
            console.log(usuariosConectados);
            io.emit('Usuarios Actualizados',Array.from(usuariosConectados));
        })
    });
   

  //Express app
  await server.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`)

    /*AWS.config.getCredentials(function(err) {
        if (err) console.log(err.stack);
        // credentials not loaded
        else {
            console.log("Access key:", AWS.config.credentials.accessKeyId);
        }
        });*/

    // Create unique bucket name
    var bucketName = 'node-sdk-sample-' + uuid.v4()
    var tokenName = '1' + uuid.v4()
    // Create name for uploaded object key
    var keyName = 'hello_world.txt'

    // Create a promise on S3 service object
  
    /*
    // Handle promise fulfilled/rejected states
    bucketPromise
      .then(function (data) {
        // Create params for putObject call
        var objectParams = {
          Bucket: bucketName,
          Key: keyName,
          Body: 'Hello World!',
        }
        // Create object upload promise
        var uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
          .putObject(objectParams)
          .promise()
        uploadPromise.then(function (data) {
          console.log('Successfully uploaded data to ' + bucketName + '/' + keyName)
        })
      })
      .catch(function (err) {
        console.error(err, err.stack)
    })*/
  })
  
}

main()


