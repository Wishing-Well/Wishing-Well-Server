// TODO: There's no user authentication

/*jshint esversion:6*/
const express = require('express');
const Wells = express.Router();
const { Well } = require('../../models');
const {BANNED_WORDS} = require('../../server/constants');

const USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED';
const SERVER_UNKNOWN_ERROR = 'SERVER_UNKNOWN_ERROR';

// title validation
const TITLE_MAX_LENGTH = 50;
const TITLE_MIN_LENGTH = 4;
const TITLE_FORBIDDEN_WORD = 'TITLE_FORBIDDEN_WORD';
const TITLE_INVALID_LENGTH = 'TITLE_INVALID_LENGTH';

function validateTitle(title, res) {
  if (title.length > TITLE_MAX_LENGTH || title.length < TITLE_MIN_LENGTH) {
    res.json({success: false, error: TITLE_INVALID_LENGTH, acceptable_range: [TITLE_MIN_LENGTH, TITLE_MAX_LENGTH]});
    return false;
  }

  if (BANNED_WORDS.some(v => title.toLowerCase().indexOf(v) !== -1)) {
    res.json({success: false, error: TITLE_FORBIDDEN_WORD});
    return false;
  }

  return true;
}

// description validation
const DESCRIPTION_MAX_LENGTH = 1000;
const DESCRIPTION_MIN_LENGTH = 0;
const DESCRIPTION_FORBIDDEN_WORD = 'DESCRIPTION_FORBIDDEN_WORD';
const DESCRIPTION_INVALID_LENGTH = 'DESCRIPTION_INVALID_LENGTH';

function validateDescription(description, res) {
  if (description.length > DESCRIPTION_MAX_LENGTH || description.length < DESCRIPTION_MIN_LENGTH) {
    res.json({success: false, error: DESCRIPTION_INVALID_LENGTH, acceptable_range: [DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH]});
    return false;
  }

  if (BANNED_WORDS.some(v => description.toLowerCase().indexOf(v) !== -1)) {
    res.json({success: false, error: DESCRIPTION_FORBIDDEN_WORD});
    return false;
  }

  return true;
}

// location validation
const LOCATION_REGEX = /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g;
const LOCATION_MAX_LENGTH = 100;
const LOCATION_MIN_LENGTH = 0;
const LOCATION_INVALID_STRING_FORMAT = 'LOCATION_INVALID_STRING_FORMAT';
const LOCATION_INVALID_LENGTH  = 'LOCATION_INVALID_LENGTH';

function validateLocation(location, res) {
  if (!location.match(LOCATION_REGEX)) {
    res.json({success: false, error: LOCATION_INVALID_STRING_FORMAT});
    return false;
  }

  if (location.length > LOCATION_MAX_LENGTH || location.length < LOCATION_MIN_LENGTH) {
    res.json({success: false, error: LOCATION_INVALID_LENGTH, acceptable_range: [LOCATION_MIN_LENGTH, LOCATION_MAX_LENGTH]});
    return false;
  }

  return true;
}

// funding_target validation
const FUNDING_TARGET_MAX_VALUE = 10000;
const FUNDING_TARGET_INVALID_NUMBER = 'FUNDINGTARGET_INVALID_NUMBER';
const FUNDING_TARGET_INVALID_VALUE = 'FUNDINGTARGET_INVALID_VALUE';

function validateFundingTarget(fundingTarget, res) {
  if (isNaN(parseFloat(fundingTarget))) {
    res.json({success: false, error: FUNDING_TARGET_INVALID_NUMBER});
    return false;
  }

  if (parseFloat(fundingTarget) > FUNDING_TARGET_MAX_VALUE) {
    res.json({success: false, error: FUNDING_TARGET_INVALID_VALUE});
    return false;
  }

  return true;
}

Wells.get('/', (req, res) => {
  Well.all().then( (wells) => {
    res.json(wells);
  });
});

Wells.get('/:id', (req, res) => {
  Well.findOne({
    where: {
      id: req.params.id
    }
  }).then( (well) => {
    res.json(well);
  });
});

Wells.post('/create', (req, res) => {
  console.log(req.body);
  console.log(req.isAuthenticated())
  if (!validateDescription(req.body.description, res)       ||
      !validateLocation(req.body.location, res)             ||
      !validateTitle(req.body.title, res)                   ||
      !validateFundingTarget(req.body.funding_target, res)) {
    return;
  }
  Well.create({
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    funding_target: req.body.funding_target,
    OrganizerId: req.body.organizer_id
  })
  .then( (well) => {
    res.json({success: true, well: well.dataValues});
  })
  .catch( (err) => {
    res.json({success: false, error: UNKNOWN_SERVER_ERROR});
  });
});

Wells.delete('/:id', (req, res) => {
  Well.destroy({
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

module.exports = Wells;