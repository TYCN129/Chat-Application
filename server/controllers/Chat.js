const { ChatModel } = require('../models/Chat');

const loadChats = async (req, res) => {
    const chats = await ChatModel.find();

    res.json({messages: chats, status: "OK"});
}

module.exports = { loadChats };