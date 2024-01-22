const http = require('http');
const app = require('./src/app')
const { Server } = require("socket.io");
const user = require('./src/models/users.model');
const {deleteBusiness} = require('./src/routes/business/business.controller');

const { connect } = require('./src/config/database');
const { setTimeout } = require('timers');
//const {setupWebSocket} = require('./src/routes/notification/notification.controller');

const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 4000 ;
const usuariosConectados = new Set();
const listaDeSocketConCorreo = {};
const arrayNegocios = [];
            
async function update(){
    await io.emit('CACA', 'CACA');
    setTimeout(update,5000);
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
    await server.listen(PORT ,() =>{
        console.log(`Server is running at port: ${PORT}`);
    });

}

main();