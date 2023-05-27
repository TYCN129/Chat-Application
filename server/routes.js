const express = require('express');
const routes = express.Router();

const { register, login, verifyLogin, logout } = require('./controllers/User');
const { loadMessages } = require('./controllers/Chat');

routes.get('/', verifyLogin);
routes.post('/register', register);
routes.post('/login', login);
routes.post('/logout', logout);
routes.get('/messages/:userID', loadMessages);

module.exports = {routes};