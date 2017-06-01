/*jshint esversion: 6*/
const express = require('express');
const app = require('./server/expressApp');
const redis = require('./server/redisApp');
const passport = require('./server/passportApp');
let server;
const wellPruner = require('./middleware/wellPruner');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// For expiring wells past expiration date
app.use(wellPruner);

// To use bodyParser
app.use(bodyParser.json());

// To use static files
app.use( express.static('public'));

// To use methodOverride
app.use(methodOverride('_method'));

// Redis
redis();

// Passport
passport();

// Routes
const apiRoutes = require('./api/index');
//const indexRoutes = require('./routes/indexRoutes');
app.use('/api', apiRoutes);
//app.use('/', indexRoutes);

server = require('./server/server.js');
