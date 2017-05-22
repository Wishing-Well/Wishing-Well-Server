// Init Passport
const app = require('./expressApp.js');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models');

module.exports = () => {

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy (
    function(email, password, done) {
      console.log('runs before serializing');
      User.findOne({
        where: {
          email: email
        }
      }).then ( user => {
        if (user === null) {
          console.log('user failed');
          return done(null, false, {message: 'bad username'});
        }else {
          bcrypt.compare(password, user.password).then(res => {
            if (res) {
              return done(null, user);
            }else {
              return done(null, false, {message: 'bad password'});
            }
          });
        }
      }).catch(err => {
        console.log('error: ', err);
      });
    }
  ));

  passport.serializeUser(function(user, done) {
    console.log('serializing');
                                // ^ ---------- given from authentication strategy
    // building the object to serialize to save
    return done(null, {
      id: user.id,
      email: user.email
    });
  });

  passport.deserializeUser(function(user, done) {
    console.log('deserializing');
                                   // ^ ---------- given from serializeUser
    User.findOne({
      where: {
        id: user.id
      }
    }).then(user => {
      return done(null, user); // <------- inserts into the request object
    });
  });

  function isAuthenticated (req, res, next) {
    console.log('checking');
    if(req.isAuthenticated()) {
      console.log('you good');
      next();
    }else {
      console.log('you bad!!!!');
      //res.redirect('/login');
    }
  }
};