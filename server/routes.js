const express = require('express');
const routes = express.Router();

const { register, login, verifyLogin, logout } = require('./controllers/User');
const { loadChats } = require('./controllers/Chat');

routes.get('/', verifyLogin);
routes.post('/register', register);
routes.post('/login', login);
routes.get('/logout', logout);
routes.get('/loadChats', loadChats);

module.exports = {routes};