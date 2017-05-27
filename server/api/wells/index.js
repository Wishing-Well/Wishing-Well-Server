// TODO: There's no user authentication

/*jshint esversion:6*/
const express = require('express');
const Wells = express.Router();
const { Well, User } = require('../../models');
const {BANNED_WORDS} = require('../../server/constants');

const USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED';
const SERVER_UNKNOWN_ERROR = 'SERVER_UNKNOWN_ERROR';
const USER_ALREADY_HAS_WELL = 'USER_ALREADY_HAS_WELL';
const USER_NOT_ENOUGH_MONEY = 'USER_NOT_ENOUGH_MONEY';
const USER_DONATED_NEGATIVE_OR_ZERO_MONEY = 'USER_DONATED_NEGATIVE_OR_ZERO_MONEY';

// title validation
const TITLE_MAX_LENGTH = 50;
const TITLE_MIN_LENGTH = 4;
const TITLE_FORBIDDEN_WORD = 'TITLE_FORBIDDEN_WORD';
const TITLE_INVALID_LENGTH = 'TITLE_INVALID_LENGTH';

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

// description validation
const DESCRIPTION_MAX_LENGTH = 1000;
const DESCRIPTION_MIN_LENGTH = 0;
const DESCRIPTION_FORBIDDEN_WORD = 'DESCRIPTION_FORBIDDEN_WORD';
const DESCRIPTION_INVALID_LENGTH = 'DESCRIPTION_INVALID_LENGTH';

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

// location validation
const LOCATION_REGEX = /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g;
const LOCATION_MAX_LENGTH = 100;
const LOCATION_MIN_LENGTH = 0;
const LOCATION_INVALID_STRING_FORMAT = 'LOCATION_INVALID_STRING_FORMAT';
const LOCATION_INVALID_LENGTH  = 'LOCATION_INVALID_LENGTH';
const LOCATION_ALREADY_USED = 'LOCATION_ALREADY_USED';

const validateLocation = (location, res) =>
  new Promise((resolve, reject) => {

    if (!location.match(LOCATION_REGEX)) {
      reject({success: false, error: LOCATION_INVALID_STRING_FORMAT});
    }

    if (location.length > LOCATION_MAX_LENGTH || location.length < LOCATION_MIN_LENGTH) {
      reject({success: false, error: LOCATION_INVALID_LENGTH, acceptable_range: [LOCATION_MIN_LENGTH, LOCATION_MAX_LENGTH]});
    }

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

// funding_target validation
const FUNDING_TARGET_MAX_VALUE = 10000;
const FUNDING_TARGET_INVALID_NUMBER = 'FUNDINGTARGET_INVALID_NUMBER';
const FUNDING_TARGET_INVALID_VALUE = 'FUNDINGTARGET_INVALID_VALUE';

const validateFundingTarget = (fundingTarget, res) => {
  if (isNaN(parseFloat(fundingTarget))) {
    res.json({success: false, error: FUNDING_TARGET_INVALID_NUMBER});
    return false;
  }

  if (parseFloat(fundingTarget) > FUNDING_TARGET_MAX_VALUE) {
    res.json({success: false, error: FUNDING_TARGET_INVALID_VALUE});
    return false;
  }

  return true;
};

const createWell = req =>
  Well.create({
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    funding_target: req.body.funding_target,
    OrganizerId: req.user.id
  });

const isUserAuthorized = req =>
  new Promise((resolve, reject) => {
    req.user ? resolve() : reject({success: false, error: USER_NOT_AUTHORIZED});
  });

const findUserWell = req =>
  Well.findOne({
    where: {
      OrganizerId: req.user.id
    }
  });

const findUser = req =>
  User.findOne({
    where: {
      id: req.user.id
    }
  });

const findWell = req =>
  Well.findOne({
    where: {
      id: req.body.id
    }
  });


Wells.get('/', (req, res) => {
  Well.all().then( (wells) => {
    res.json({success: true, wells});
  });
});

Wells.get('/:id', (req, res) => {
  Well.findOne({
    where: {
      id: req.params.id
    }
  }).then( (well) => {
    res.json({success: true, well});
  });
});

Wells.post('/create', (req, res) => {
  console.log('test')

  isUserAuthorized(req)
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
    console.log('success')
    res.json({success: true, well: well.dataValues});
  })
  .catch( (err) => {
    console.log(err)
    res.json(err);
  });
});

Wells.put('/donate', (req, res) => {
  isUserAuthorized(req)
  .then( () => findUser(req) )
  .then( user => {
    return new Promise((resolve, reject) => {
      console.log(req.body.amount, user.dataValues)
      if (Number(req.body.amount) <= 0) reject({success: false, error: USER_DONATED_NEGATIVE_OR_ZERO_MONEY});
      if (Number(req.body.amount) > user.dataValues.coin_inventory) {
        reject({success: false, error: USER_NOT_ENOUGH_MONEY});
      }
      req.body.user = user;
      resolve();
    });
  })
  .then ( () => findWell(req))
  .then( well => {
    return new Promise((resolve, reject) => {
      if (!well) reject({success: false, error: WELL_DOES_NOT_EXIST});
      req.body.well = well;
      resolve();
    });
  })
  .then( () => {
    return User.update(
      { coin_inventory: req.body.user.coin_inventory - req.body.amount,
        amount_donated: req.body.user.amount_donated + Number(req.body.amount) },
      { where: {id: req.user.id} }
    );
  })
  .then( () => {
    return Well.update(
      { current_amount: req.body.well.current_amount + Number(req.body.amount) },
      { where: {id: req.body.id} }
    );
  })
  .then( () => {
    req.body.user.coin_inventory -= req.body.amount;
    req.body.user.amount_donated += Number(req.body.amount);
    req.body.well.current_amount += Number(req.body.amount);
    res.json({success: true, user: req.body.user, well: req.body.well});
  })
  .catch( (err) => {
    if (typeof err !== 'string') {
      console.log(err);
      res.json({success: false, error: SERVER_UNKNOWN_ERROR});
    } else {
      console.log(err);
      res.json(err);
    }
  });
});

module.exports = Wells;