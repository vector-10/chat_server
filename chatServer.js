const express    = require('express');
const app        = express();
const cors       = require('cors')
const bodyParser = require('body-parser');
const http       = require('http').Server(app);


// middleware for body parsing and resource sharing
app.use(cors());
app.use(bodyParser.json());

// cors  options for restricted routes
const socketIO = require('socket.io')(http, {
    cors:{
        origin: 'http://localhost:3000'
    }
})

//Array for all active user to be stored
let users = [];

socketIO.on('connection', (socket) => {
    console.log(`User with ID ${socket.id} just connected`);

    //To troublehsoot connection errors 
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    //Listens and logs the message to the console
  socket.on('message', (data) => {
    console.log(data);
  });

    //sends message to all users on the server
  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data)
  });

  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));


  //check for when a new user joins the chat
  socket.on('newUser', (data) => {
    users.push(data);
    console.log(users);

    socketIO.emit('newUserResponse', users);
    })


    //to disconnect from the chat room
  socket.on('disconnect', () => {
        console.log(`User with ID ${socket.id} disconnected`)        

        users = users.filter((user) => user.socketID !== socket.id)

        socketIO.emit('newUserResponse', users)
        socket.disconnect();
    });
});

//To check if the server is running
app.get('/', (req, res) => {
  res.json({message:"Server runtime Check"})
})

const PORT = process.env.PORT || 4000

http.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`)
})