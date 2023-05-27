const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        null: false
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        null: false
    },
    text: {
        type: String
    },
    file: {
        type: Object
    }
},{timestamps: true});

const ChatModel = mongoose.model('Chat', ChatSchema);
module.exports = {ChatModel};