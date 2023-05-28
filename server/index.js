require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ws = require('ws');
const jwt = require('jsonwebtoken');
mongoose.set("strictQuery", true);

const { UserModel } = require('./models/User');
const { ChatModel } = require('./models/Chat');

const { routes } = require('./routes');

// const mongoURL = "mongodb://localhost:27017/chat-app-DB";
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL).then(() => console.log("Successfully connected to the database"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://chat-frontend-7ujq.onrender.com:3000"
    ],
    credentials: true
}));
app.use('/',routes);


const server = app.listen(3001, () => console.log("Server started listening to port 3001"));

const wsServer = new ws.WebSocketServer({server: server});

wsServer.on('connection', (connection, req) => {
    console.log("A new client has been connected to the server!");

    const notifyOnlinePeople = () => {
        [...wsServer.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wsServer.clients].map(c => ({userID: c.userID, username: c.username}))
            }));
        });
    }

    connection.isAlive = true;

    connection.pingTimer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.pingTimer);
            connection.terminate();
            notifyOnlinePeople();
        }, 2000);
    }, 5000)

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
    })

    const cookie = req.headers.cookie;
    if(cookie) {
        const partitions = cookie.split(';');
        if(partitions) {
            const tokenString = partitions.find(str => str.startsWith('token='));
            if(tokenString) {
                const token = tokenString.split('=')[1];
                if(token) {
                    jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
                        if(err) throw err;
                        else {
                            connection.username = userData.username;
                            connection.userID = userData.userID;
                        }
                    })
                }
            }
        }
    }

    notifyOnlinePeople();

    connection.on('message', async (message) => {
        const messageData = JSON.parse(message);
        if(messageData.text) {
            console.log("A message has been received from the client: " + messageData.text);
            
            const newMessage = await ChatModel.create({
                from: connection.userID,
                to: messageData.to,
                text: messageData.text,
            });
            
            [...wsServer.clients].filter(client => client.userID === messageData.to).forEach(client => client.send(JSON.stringify({
                text: messageData.text,
                from: connection.userID,
                to: messageData.to,
                _id: newMessage._id
            })));
        }
    });

    connection.on('close', () => {
        console.log("Client disconnected from the server");
        notifyOnlinePeople();
    })
});

wsServer.on('close', () => {
    console.log('Closed');
})