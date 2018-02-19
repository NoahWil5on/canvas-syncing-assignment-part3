const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);
const io = socketio(app);

console.log(`Listening on 127.0.0.1: ${port}`);

const draws = {};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    console.log(data);

    draws[data.name] = { time: data.time, coords: data.coords };

    socket.name = data.name;
    socket.join('room1');
    io.sockets.in('room1').emit('msg', { draws });
  });
};
const onMsg = (sock) => {
  const socket = sock;
  socket.on('update', (data) => {
    if (draws[socket.name].time !== data.time) {
      draws[socket.name].time = data.time;
      draws[socket.name].coords = data.coords;

      io.sockets.in('room1').emit('msg', { draws });
    }
  });
};

io.sockets.on('connection', (socket) => {
  console.log('started');

  onMsg(socket);
  onJoined(socket);
});

