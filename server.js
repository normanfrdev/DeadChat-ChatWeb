const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};
let chatHistory = []; 

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.emit('chat history', chatHistory);

  socket.on('join', (data) => {
    users[socket.id] = data.username;
    socket.broadcast.emit('user connected', data.username);
    console.log(`${data.username} joined the chat`);
  });

  socket.on('chat message', (msg) => {
    if (users[socket.id]) {
      const message = { username: users[socket.id], message: msg };
      chatHistory.push(message);
      if (chatHistory.length > 15) {
        chatHistory.shift(); 
      }
      io.emit('chat message', message);
      console.log(`Message from ${users[socket.id]}: ${msg}`);
    }
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      socket.broadcast.emit('user disconnected', users[socket.id]);
      console.log(`${users[socket.id]} disconnected`);
      delete users[socket.id];
    }
  });
});

server.listen(3000, () => {
  console.log('Listening on *:3000');
});
