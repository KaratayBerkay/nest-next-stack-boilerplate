import { WebSocketServer } from 'ws';

const port = parseInt(process.env.WS_PORT ?? '3002', 10);
const wss = new WebSocketServer({ port });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const text = data.toString();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    });
  });
});

console.log(`Raw WebSocket server listening on ws://localhost:${port}`);
