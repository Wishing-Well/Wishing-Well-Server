/*jshint esversion:6*/
const express = require('express');
const Users = express.Router();
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const {saltRounds, BANNED_WORDS} = require('../../server/constants');
const passport = require('passport');

const SERVER_UNKNOWN_ERROR = 'SERVER_UNKNOWN_ERROR';
const REGISTRATION_USER_ALREADY_EXISTS = 'REGISTRATION_USER_ALREADY_EXISTS';
const LOGIN_INVALID = 'LOGIN_INVALID';

// email validation
const EMAIL_REGEX = /[a-z0-9]+[_a-z0-9\.-]*[a-z0-9]+@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})/gi;
const EMAIL_MAX_LENGTH = 100;
const EMAIL_FORBIDDEN_WORD = 'EMAIL_FORBIDDEN_WORD';
const EMAIL_INVALID_STRING_FORMAT = 'EMAIL_INVALID_STRING_FORMAT';
const EMAIL_INVALID_LENGTH = 'EMAIL_INVALID_LENGTH';

function validateEmail(email, res) {
  if (!email.match(EMAIL_REGEX)) {
    res.json({success: false, error: EMAIL_INVALID_STRING_FORMAT});
    return false;
  }

  if (email.length > EMAIL_MAX_LENGTH) {
    res.json({success: false, error: EMAIL_INVALID_LENGTH});
    return false;
  }

  if (BANNED_WORDS.some(v => email.toLowerCase().indexOf(v) !== -1)) {
    res.json({success: false, error: EMAIL_FORBIDDEN_WORD});
    return false;
  }

  return true;
}

// full_name validation
const FULL_NAME_REGEX = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
const FULL_NAME_MAX_LENGTH = 50;
const FULL_NAME_FORBIDDEN_WORD = 'FULL_NAME_FORBIDDEN_WORD';
const FULL_NAME_INVALID_STRING_FORMAT = 'FULL_NAME_INVALID_STRING_FORMAT';
const FULL_NAME_INVALID_LENGTH = 'FULL_NAME_INVALID_LENGTH';

function validateFullName(fullName, res) {
  if (!FULL_NAME_REGEX.test(fullName)) {
    res.json({success: false, error: FULL_NAME_INVALID_STRING_FORMAT});
    return false;
  }

  if (fullName.length > FULL_NAME_MAX_LENGTH) {
    res.json({success: false, error: FULL_NAME_INVALID_LENGTH});
    return false;
  }

  if (BANNED_WORDS.some(v => fullName.toLowerCase().indexOf(v) !== -1)) {
    res.json({success: false, error: FULL_NAME_FORBIDDEN_WORD});
    return false;
  }

  return true;
}

// password validation
const PASSWORD_MAX_LENGTH = 500;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_INVALID_LENGTH = 'PASSWORD_INVALID_LENGTH';

function validatePassword(password, res) {
  if (password.length > PASSWORD_MAX_LENGTH || password.length < PASSWORD_MIN_LENGTH) {
    res.json({success: false, error: PASSWORD_INVALID_LENGTH});
    return false;
  }

  return true;
}

Users.post('/create', (req, res) => {
  if (!validateEmail(req.body.email, res)        ||
      !validateFullName(req.body.full_name, res) ||
      !validatePassword(req.body.password, res)) {
    return;
  }
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      User.create({
        email: req.body.email.toLowerCase(),
        full_name: req.body.full_name,
        password: hash
      })
      .then( (user) => {
        res.json({success: true, user: user.dataValues});
      })
      .catch((err) => {
        res.json({success: false, error: REGISTRATION_USER_ALREADY_EXISTS});
      });
    });
  });
});

Users.post('/login',
  passport.authenticate('local', { failWithError: true }),
  function(req, res, next) {
    User.findOne({
      where: {
        email: req.body.username.toLowerCase()
      }
    }).then( (user) => {
      res.json({success: true, user: user.dataValues});
    });
  },
  function(err, req, res, next) {
    return res.json({success: false, error: LOGIN_INVALID});
  }
);

Users.delete('/:id', (req, res) => {
  User.destroy({
    where: {
      id: req.params.id
    }
  })
  .then( () => {
    res.json({success: true});
  })
  .catch( (err) => {
    res.json({success: false});
  });
});

module.exports = Users;