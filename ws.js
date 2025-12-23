import { WebSocketServer } from 'ws'; // Import the server class



let getWs = ( host = '0.0.0.0', port = 8090, onMsg = undefined ) => {
    let wss = new WebSocketServer({ port }); // Create a WebSocket server on port 8080
    
    wss.on('connection', function connection(ws) {
      console.log('#WS Client connected');
    
      ws.on('message', (data) => {
        if( onMsg ){
            onMsg( ws, data );
        } else {
            console.log(`#WS Received message: ${data}`);
            // Echo message back to client
            ws.send(`Server received: ${data}`);
        }
      });
    
      ws.on('close', () => {
        console.log('#WS Client disconnected');
      });
    });
    
    console.log('#WS server is running on ws://0.0.0.0:'+port);

    return wss;
}

export { getWs } 