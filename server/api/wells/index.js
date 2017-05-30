// TODO: There's no user authentication

/*jshint esversion:6*/
const express = require('express');
const Wells = express.Router();
const { Well, User, Donation, Message } = require('../../models');
const {BANNED_WORDS} = require('../../server/constants');
const STRIPE_SECRET_KEY = require('../../server/stripe_key');
const STRIPE_PUBLIC_KEY = require('../../server/stripe_public_key');
const stripe = require("stripe")(STRIPE_SECRET_KEY);
let stripeAccount;

stripe.accounts.create({
  country: "US",
  type: "custom"
})
.then(acct => {
  stripeAccount = acct;
});

// Universal errors
const SERVER_UNKNOWN_ERROR = 'SERVER_UNKNOWN_ERROR';
const USER_NOT_AUTHENTICATED = 'USER_NOT_AUTHENTICATED';
const USER_ALREADY_HAS_WELL = 'USER_ALREADY_HAS_WELL';
const USER_NOT_ENOUGH_MONEY = 'USER_NOT_ENOUGH_MONEY';
const USER_DONATED_NEGATIVE_OR_ZERO_MONEY = 'USER_DONATED_NEGATIVE_OR_ZERO_MONEY';
const WELL_NOT_FOUND = 'WELL_NOT_FOUND';
// Validations and specific errors
// title validation
const TITLE_MAX_LENGTH = 50;
const TITLE_MIN_LENGTH = 4;
const TITLE_FORBIDDEN_WORD = 'TITLE_FORBIDDEN_WORD';
const TITLE_INVALID_LENGTH = 'TITLE_INVALID_LENGTH';
// description validation
const DESCRIPTION_MAX_LENGTH = 1000;
const DESCRIPTION_MIN_LENGTH = 0;
const DESCRIPTION_FORBIDDEN_WORD = 'DESCRIPTION_FORBIDDEN_WORD';
const DESCRIPTION_INVALID_LENGTH = 'DESCRIPTION_INVALID_LENGTH';
// location validation
// LOCATION_REGEX matches a CSV geometric point, e.g. "90.2,23.12312"
const LOCATION_REGEX = /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g;
const LOCATION_MAX_LENGTH = 100;
const LOCATION_MIN_LENGTH = 0;
const LOCATION_INVALID_STRING_FORMAT = 'LOCATION_INVALID_STRING_FORMAT';
const LOCATION_INVALID_LENGTH  = 'LOCATION_INVALID_LENGTH';
const LOCATION_ALREADY_USED = 'LOCATION_ALREADY_USED';
// funding_target validation
const FUNDING_TARGET_MAX_VALUE = 10000;
const FUNDING_TARGET_INVALID_NUMBER = 'FUNDINGTARGET_INVALID_NUMBER';
const FUNDING_TARGET_INVALID_VALUE = 'FUNDINGTARGET_INVALID_VALUE';

/**
 * Validates if title is a valid argument
 * @param {String} title
 * @param {Object} res
 * @return Promise
 */
const validateTitle = (title, res) =>
  new Promise((resolve, reject) => {
    if (title.length > TITLE_MAX_LENGTH || title.length < TITLE_MIN_LENGTH) {
      reject({success: false, error: TITLE_INVALID_LENGTH, acceptable_range: [TITLE_MIN_LENGTH, TITLE_MAX_LENGTH]});
    }

    if (BANNED_WORDS.some(v => title.toLowerCase().indexOf(v) !== -1)) {
      reject({success: false, error: TITLE_FORBIDDEN_WORD});
    }

    resolve();
  });

/**
 * Validates if description is a valid argument
 * @param {String} description
 * @param {Object} res
 * @return Promise
 */
const validateDescription = (description, res) =>
  new Promise((resolve, reject) => {
    if (description.length > DESCRIPTION_MAX_LENGTH || description.length < DESCRIPTION_MIN_LENGTH) {
      reject({success: false, error: DESCRIPTION_INVALID_LENGTH, acceptable_range: [DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH]});
    }

    if (BANNED_WORDS.some(v => description.toLowerCase().indexOf(v) !== -1)) {
      reject({success: false, error: DESCRIPTION_FORBIDDEN_WORD});
    }

    resolve();
  });

/**
 * Validates if location is a valid argument
 * @param {String} location
 * @param {Object} res
 * @return Promise
 */
const validateLocation = (location, res) =>
  new Promise((resolve, reject) => {

    if (!location.match(LOCATION_REGEX)) {
      reject({success: false, error: LOCATION_INVALID_STRING_FORMAT});
    }

    if (location.length > LOCATION_MAX_LENGTH || location.length < LOCATION_MIN_LENGTH) {
      reject({success: false, error: LOCATION_INVALID_LENGTH, acceptable_range: [LOCATION_MIN_LENGTH, LOCATION_MAX_LENGTH]});
    }

    // Check if there is an existing well at this location
    Well.findOne({
      where: {
        location: location
      }
    })
    .then( (well) => {
      well === null ? resolve({success: true}) : reject({success: false, error: LOCATION_ALREADY_USED});
    })
    .catch( () => {
      reject({success: false, error: SERVER_UNKNOWN_ERROR});
    });
  });

/**
 * Validates if funding target is a valid argument
 * @param {Number} fundingTarget
 * @param {Object} res
 * @return Promise
 */
const validateFundingTarget = (fundingTarget, res) =>
  new Promise((resolve, reject) => {

    if (isNaN(parseFloat(fundingTarget))) {
      reject({success: false, error: FUNDING_TARGET_INVALID_NUMBER});
    }

    if (parseFloat(fundingTarget) > FUNDING_TARGET_MAX_VALUE) {
      reject({success: false, error: FUNDING_TARGET_INVALID_VALUE});
    }

    resolve();
  });

/**
 * Sends a well creation query.
 * @param {Object} req
 * @return Promise
 */
const createWell = req =>
  stripe.accounts.createExternalAccount(stripeAccount.id,{
    external_account: req.body.token.tokenId
  })
  .then( acct => {
    return Well.create({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      funding_target: req.body.funding_target,
      UserId: req.user.id,
      token: acct
    });
  });


/**
 * Sends a donation creation query.
 * @param {Object} req
 * @return Promise
 */
const createDonation = req =>
  Donation.create({
    UserId: req.user.id,
    amount: req.body.amount,
    WellId: req.body.id,
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

/**
 * Finds a well assigned to the logged-in user.
 * Only meant to be used for validations and not for API.
 * @param {Object} req
 * @return Promise
 */
const findUserWell = req =>
  Well.findOne({
    where: {
      UserId: req.user.id
    }
  });

/**
 * Finds a well assigned to the logged-in user.
 * Only meant to be used for validations and not for API.
 * @param {Object} req
 * @return Promise
 */
const findUser = req =>
  User.findOne({
    where: {
      id: req.user.id
    }
  });

/**
 * Finds a specific well.
 * @param {Object} req
 * @return Promise
 */
const findWell = req =>
  Well.findOne({
    where: {
      id: req.body.id
    },
  });

/**
 * API endpoint.
 * Finds all wells.
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
Wells.get('/', (req, res) => {
  Well.all()
  .then( (wells) => {
    res.json({success: true, wells});
  })
  .catch( (err) => {
    console.log(err, 'api/wells/ GET failed');
    res.json({success: false, err: SERVER_UNKNOWN_ERROR});
  });
});

/**
 * API endpoint.
 * Finds a specific well.
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
Wells.get('/:id', (req, res) => {
  req.body.id = req.params.id;
  findWell(req)
  .then( (well) => {
    res.json({success: true, well});
  })
  .catch( (err) => {
    console.log(err, 'api/wells/:id GET failed');
    res.json({success: false, err: SERVER_UNKNOWN_ERROR});
  });
});

/**
 * API endpoint.
 * Creates a well with location, description, title, funding_target arguments on req.body.
 * User id is included on req.user by passportApp
 * @param {Object} req
 * @return void
 */
Wells.post('/create', (req, res) => {
  console.log(req.body);
  isUserAuthenticated(req)
  .then( () => findUserWell(req) )
  .then( well => new Promise((resolve, reject) => {
    // User is currently allowed only one well, so fail out if we find one
    !well ? resolve() : reject({success: false, error: USER_ALREADY_HAS_WELL});
  }))
  .then( () => validateLocation(req.body.location) )
  .then( () => validateDescription(req.body.description) )
  .then( () => validateTitle(req.body.title) )
  .then( () => validateFundingTarget(req.body.funding_target) )
  .then( () => createWell(req) )
  .then( (well) => {
    res.redirect('../users/info');
  })
  .catch( (err) => {
    console.log(err, 'api/wells/create POST failed');
    res.json(err);
  });
});

/**
 * API endpoint.
 * Donates to a specific well.
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
Wells.put('/donate', (req, res) => {


  isUserAuthenticated(req)
  .then ( () => findWell(req))
  .then( well => {
    return new Promise((resolve, reject) => {
      // Check if well exists
      if (!well) reject({success: false, error: WELL_DOES_NOT_EXIST});
      req.body.well = well;
      resolve();
    });
  })
  .then( () => {
    return stripe.customers.create({
      email: req.user.email,
      source: req.body.token.tokenId,

    });
  })
  .then( customer => {
    return stripe.charges.create({
      amount: Number(req.body.amount),
      description: "Sample Charge",
      currency: "usd",
      customer: customer.id,
      destination: req.body.well.token
    });
  })
  .then( (charge) => { console.log(charge) })
  .then( () => createDonation(req) )
  .then( () => {
    return Well.update(
      { current_amount: req.body.well.current_amount + Number(req.body.amount) },
      { where: {id: req.body.id} }
    );
  })
  .then( () => {
    res.redirect('../users/info');
  })
  .catch( (err) => {
    console.log(err, 'api/wells/donate POST failed');
    if (typeof err.error !== 'string') {
      res.json({success: false, error: SERVER_UNKNOWN_ERROR});
    } else {
      res.json(err);
    }
  });
});

module.exports = Wells;