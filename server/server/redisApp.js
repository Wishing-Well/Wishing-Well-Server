//Redis Server
const app = require('./expressApp.js');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const REDIS_SECRET = require('./redis_secret.js');

module.exports = () => {
  app.use(session({
    store: new RedisStore(),
    secret: REDIS_SECRET,
    resave: false,
    saveUninitialized: true
  }));
};

