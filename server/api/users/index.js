/*jshint esversion:6*/
const express = require('express');
const Users = express.Router();
const { User, Well, Donation } = require('../../models');
const bcrypt = require('bcrypt');
const {saltRounds, BANNED_WORDS} = require('../../server/constants');
const passport = require('passport');

// Universal errors
const SERVER_UNKNOWN_ERROR = 'SERVER_UNKNOWN_ERROR';
const REGISTRATION_USER_ALREADY_EXISTS = 'REGISTRATION_USER_ALREADY_EXISTS';
const LOGIN_INVALID = 'LOGIN_INVALID';
const USER_NOT_AUTHENTICATED = 'USER_NOT_AUTHENTICATED';
// Validations and specific errors
// email validation
// EMAIL_REGEX matches a person's email, e.g. "JohnSmith@Gmail.com"
const EMAIL_REGEX = /[a-z0-9]+[_a-z0-9\.-]*[a-z0-9]+@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})/i;
const EMAIL_MAX_LENGTH = 100;
const EMAIL_MIN_LENGTH = 0;
const EMAIL_FORBIDDEN_WORD = 'EMAIL_FORBIDDEN_WORD';
const EMAIL_INVALID_STRING_FORMAT = 'EMAIL_INVALID_STRING_FORMAT';
const EMAIL_INVALID_LENGTH = 'EMAIL_INVALID_LENGTH';
// full_name validation
// FULL_NAME_REGEX matches a person's full name, e.g. "John Smith"
const FULL_NAME_REGEX = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
const FULL_NAME_MAX_LENGTH = 50;
const FULL_NAME_MIN_LENGTH = 0;
const FULL_NAME_FORBIDDEN_WORD = 'FULL_NAME_FORBIDDEN_WORD';
const FULL_NAME_INVALID_STRING_FORMAT = 'FULL_NAME_INVALID_STRING_FORMAT';
const FULL_NAME_INVALID_LENGTH = 'FULL_NAME_INVALID_LENGTH';
// password validation
const PASSWORD_MAX_LENGTH = 500;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_INVALID_LENGTH = 'PASSWORD_INVALID_LENGTH';

/**
 * Validates if email is a valid argument
 * @param {String} email
 * @param {Object} res
 * @return Promise
 */
const validateEmail = (email, res) =>
  new Promise((resolve, reject) => {
    if (!email.match(EMAIL_REGEX)) {
      reject({success: false, error: EMAIL_INVALID_STRING_FORMAT});
    }

    if (email.length > EMAIL_MAX_LENGTH || email.length < EMAIL_MIN_LENGTH) {
      reject({success: false, error: EMAIL_INVALID_LENGTH, acceptable_length: [EMAIL_MIN_LENGTH, EMAIL_MAX_LENGTH]});
    }

    if (BANNED_WORDS.some(v => email.toLowerCase().indexOf(v) !== -1)) {
      reject({success: false, error: EMAIL_FORBIDDEN_WORD});
    }

    resolve();
  });

/**
 * Validates if full name is a valid argument
 * @param {String} fullName
 * @param {Object} res
 * @return Promise
 */
const validateFullName = (fullName, res) =>
  new Promise((resolve, reject) => {
    if (!FULL_NAME_REGEX.test(fullName)) {
      reject({success: false, error: FULL_NAME_INVALID_STRING_FORMAT});
    }

    if (fullName.length > FULL_NAME_MAX_LENGTH || fullName.length < FULL_NAME_MIN_LENGTH) {
      reject({success: false, error: FULL_NAME_INVALID_LENGTH, acceptable_length: [FULL_NAME_MIN_LENGTH, FULL_NAME_MAX_LENGTH]});
    }

    if (BANNED_WORDS.some(v => fullName.toLowerCase().indexOf(v) !== -1)) {
      reject({success: false, error: FULL_NAME_FORBIDDEN_WORD});
    }

    resolve();
  });

/**
 * Validates if password is a valid argument
 * @param {String} password
 * @param {Object} res
 * @return Promise
 */
const validatePassword = (password, res) =>
  new Promise((resolve, reject) => {
    if (password.length > PASSWORD_MAX_LENGTH || password.length < PASSWORD_MIN_LENGTH) {
      reject({success: false, error: PASSWORD_INVALID_LENGTH, acceptable_length: [PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH]});
    }

    resolve();
  });

/**
 * Checks if user object was added to req (should be added by /server/server/passportApp)
 * @param {Object} req
 * @return Promise
 */
const isUserAuthenticated = req =>
  new Promise((resolve, reject) => {
    req.user ? resolve() : reject({success: false, error: USER_NOT_AUTHENTICATED});
  });

/* API endpoint.
 * Finds user info for currently logged-in user.
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
Users.get('/info', (req, res) => {

  if (!req.user) {
    return res.json({success: false, error: USER_NOT_AUTHENTICATED});
  }

  User.findOne({
    where: {
      id: req.user.id
    },
    include: [{model: Well}, {model: Donation}]
  })
  .then((user) => {
    res.json({success: true, user: user.dataValues});
  })
  .catch((err) => {
    console.log(err, 'api/users/info GET failed');
    res.json({success: false, error: SERVER_UNKNOWN_ERROR});
  });
});

/* API endpoint.
 * Creates a user
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
Users.post('/create', (req, res) => {
  validateEmail(req.body.email, res)
  .then( () => validateFullName(req.body.full_name, res) )
  .then( () => validatePassword(req.body.password, res) )
  .then( () => {
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
          console.log(err, 'api/users/create POST failed');
          res.json({success: false, error: REGISTRATION_USER_ALREADY_EXISTS});
        });
      });
    });
  })
  .catch( (err) => {
    console.log(err, 'api/users/create POST failed');
    res.json(err);
  });
});

/* API endpoint.
 * Logs a user in with an email and password.
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
Users.post('/login',
  passport.authenticate('local', { failWithError: true }),
  function(req, res, next) {
    res.redirect('info');
  },
  function(err, req, res, next) {
    console.log(err, 'api/users/login POST failed');
    return res.json({success: false, error: LOGIN_INVALID});
  }
);

/* API endpoint.
 * Logs current user out.
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
Users.post('/logout', (req, res) => {
  req.logout();
  res.json({success: true});
});

/* API endpoint.
 * Returns if user is currently logged into server or not.
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
Users.get('/loggedin', (req, res) => {
  res.json({success: req.isAuthenticated()});
});

module.exports = Users;