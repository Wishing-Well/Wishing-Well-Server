// TODO: There's no user authentication

/*jshint esversion:6*/
const express = require('express');
const Wells = express.Router();
const { Well } = require('../../models');
const {BANNED_WORDS} = require('../../server/constants');

const USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED';
const UNKNOWN_SERVER_ERROR = 'UNKNOWN_SERVER_ERROR';

// description validation
const DESCRIPTION_MAX_LENGTH = 1000;
const DESCRIPTION_FORBIDDEN_WORD = 'DESCRIPTION_FORBIDDEN_WORD';
const DESCRIPTION_INVALID_LENGTH = 'DESCRIPTION_INVALID_LENGTH';

function validateDescription(description, res) {
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    res.json({success: false, error: DESCRIPTION_INVALID_LENGTH});
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
const LOCATION_INVALID_STRING_FORMAT = 'LOCATION_INVALID_STRING_FORMAT';
const LOCATION_INVALID_LENGTH  = 'LOCATION_INVALID_LENGTH';

function validateLocation(location, res) {
  if (!LOCATION_REGEX.test()) {
    res.json({success: false, error: LOCATION_INVALID_STRING_FORMAT});
    return false;
  }

  if (location.length > LOCATION_MAX_LENGTH) {
    res.json({success: false, error: LOCATION_INVALID_LENGTH});
    return false;
  }

  return true;
}

// funding_target validation
const FUNDINGTARGET_MAX_VALUE = 100;
const FUNDINGTARGET_INVALID_NUMBER = 'FUNDINGTARGET_INVALID_NUMBER';
const FUNDINGTARGET_INVALID_VALUE = 'FUNDINGTARGET_INVALID_VALUE';

function validateFundingTarget(fundingTarget, res) {
  if (isNaN(parseFloat(fundingTarget))) {
    res.json({success: false, error: FUNDINGTARGET_INVALID_NUMBER});
    return false;
  }

  if (parseFloat(fundingTarget) > FUNDINGTARGET_MAX_VALUE) {
    res.json({success: false, error: FUNDINGTARGET_INVALID_VALUE});
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

Wells.post('/', (req, res) => {
  if (!validateDescription(req.body.description, res)       ||
      !validateLocation(req.body.location, res)             ||
      !validateFundingTarget(req.body.funding_target, res)) {
    return;
  }
  Well.create({
    description: req.body.description,
    location: req.body.location,
    funding_target: req.body.funding_target
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