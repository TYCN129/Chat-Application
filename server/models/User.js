const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        null: false
    },
    password: {
        type: String,
        null: false
    }
},{timestamps: true});

const UserModel = mongoose.model('User', UserSchema);
module.exports = {UserModel};