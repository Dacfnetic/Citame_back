const WebSocket = require('ws');

//Referencia de clientes conectados
const clientOnServer = new Set();


function setupWebSocket(server){
  const wss = new WebSocket.Server({ noServer: true });

  //Verificacion de cliente conectado
  wss.on('connection', (ws) => {
    clientOnServer.add(ws);
    console.log('Usuario conectado');

    // desconexión del cliente
    ws.on('close', () => {
      clientOnServer.delete(ws);
      console.log('Usuario desconectado');
    });
  });

  // instancia de WebSocket al servidor HTTP
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  return wss;
};

function enviarNotificacion(req, res) {
    try {
     
        const {message} = req.body;

        const notificacionEnviada = JSON.stringify( { message,registroHora: new Date() } );

        //Recorrer todos los clientes conectados

        clientOnServer.forEach((cliente) => {

            //Solamente envia notificaciones a clientes conectados
            if(cliente.readyState == WebSocket.OPEN){
                cliente.send(notificacionEnviada);
            }


        });


        res.status(200).json({success:true});

    } catch (error) {

        console.log("No la mandaste, mira que esta malo.")
        res.status(500).json({success: false, error:'Error al enviar la noti'});

    }
  }


module.exports = {
    setupWebSocket,
    enviarNotificacion
}





  