const { ChatModel } = require('../models/Chat');
const jwt = require('jsonwebtoken');

const getUserDataFromRequest = async (req) => {
    const token = req.headers.cookie.split(';').find(str => str.startsWith('token=')).split('=')[1];
    if(token) {
        const userData = await jwt.verify(token, process.env.JWT_SECRET);
        if(userData) {
            return userData;
        }
    }
}

const loadMessages = async (req, res) => {
    const userID = req.params.userID;
    // const userData = await getUserDataFromRequest(req);
    const {ourUserID} = req.body;

    console.log(ourUserID);

    const messages = await ChatModel.find({
        from: {$in:[userID, ourUserID]},
        to: {$in:[userID, ourUserID]}
    }).sort({createdAt: 1});

    res.json(messages);
}

module.exports = { loadMessages };