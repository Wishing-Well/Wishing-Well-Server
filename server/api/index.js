const express = require('express');
const Router = express.Router();

Router.use('/users', require('./users'));
Router.use('/wells', require('./wells'));
Router.use('/payments', require('./payments'));


module.exports = Router;