/*jshint esversion:6*/
const express = require('express');
const Users = express.Router();
const { User } = require('../../models');

Users.get('/', (req, res) => {
  User.all().then( (users) => {
    res.json(users);
  });
});

Users.get('/:id', (req, res) => {
  User.findOne({
    where: {
      id: req.params.id
    }
  }).then( (user) => {
    res.json(user);
  });
});

Users.post('/', (req, res) => {
  User.create({
    username: req.body.username,
    password: req.body.password
  })
  .then( (user) => {
    res.json(user);
  })
  .catch( (err) => {
    res.json(err);
  });
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