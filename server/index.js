require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
mongoose.set("strictQuery", true);

const { UserModel } = require('./models/User');
const { routes } = require('./routes');

// const mongoURL = "mongodb://localhost:27017/chat-app-DB";
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL).then(() => console.log("Successfully connected to the database"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    credentials: true
}));

app.use('/',routes);
app.listen(3001, () => console.log("Server started listening to port 3001"));