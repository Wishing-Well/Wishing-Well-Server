//Redis Server
const app = require('./expressApp.js');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

module.exports = () => {
  app.use(session({
    store: new RedisStore(),
    secret: 'ezg89mX2UA8X7OTYcnas',
    resave: false,
    saveUninitialized: true
  }));
};

