const express = require('express');
const Router = express.Router();

Router.use('/users', require('./users'));
Router.use('/wells', require('./wells'));

module.exports = Router;