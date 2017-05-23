/*jshint esversion:6*/
const express = require('express');
const Users = express.Router();
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const {saltRounds} = require('../../server/constants');
const passport = require('passport');

Users.get('/', (req, res) => {
  User.all().then( (users) => {
    res.json(users);
  });
});

/*Users.get('/:id', (req, res) => {
  User.findOne({
    where: {
      id: req.params.id
    }
  }).then( (user) => {
    res.json(user);
  });
});*/

Users.post('/', (req, res) => {
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      User.create({
        email: req.body.email,
        full_name: req.body.full_name,
        password: hash
      })
      .then( (user) => {
        res.json({success: true, user_id: user.dataValues.id});
      })
      .catch((err) => {
        res.json({success: false});
      });
    });
  });
});

Users.post('/login',
  passport.authenticate('local', { failWithError: true }),
  function(req, res, next) {
    User.findOne({
      where: {
        email: req.body.username
      }
    }).then( (user) => {
      console.log(user);
      res.json({success: true, user_id: user.dataValues.id});
    });
  },
  function(err, req, res, next) {
    return res.json({success: false});
  }
);

Users.get('/login-success', (req, res) => {
  console.log(req.body);
  User.findOne({
    where: {
      email: req.body.username
    }
  }).then( (user) => {
    console.log(user);
    res.json({success: true, user_id: user.dataValues.id});
  });

});

Users.get('/login-failure', (req, res) => {
  res.json({success: false});
});

Users.delete('/:id', (req, res) => {
  console.log(req.params.id);
  User.destroy({
    where: {
      id: req.params.id
    }
  })
  .then( () => {
    res.json({success: true});
  })
  .catch( (err) => {
    res.json({sucess: false});
  });
});

module.exports = Users;