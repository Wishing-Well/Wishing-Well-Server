/*jshint esversion:6*/
const express = require('express');
const Wells = express.Router();
const { Well } = require('../../models');

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
  Well.create({
    description: req.body.description,
    location: req.body.location,
    funding_target: req.body.funding_target,
    current_amount: req.body.current_amount,
    start_date: req.body.start_date,
    expiration_date: req.body.expiration_date,
    createdAt: req.body.createdAt,
    updatedAt: req.body.updatedAt,
    UserId: req.body.UserId,
    OrganizerId: req.body.OrganizerId,
  })
  .then( (well) => {
    res.json(well);
  })
  .catch( (err) => {
    res.json(err);
  });
});

Wells.delete('/:id', (req, res) => {
  console.log(req.params.id);
  Well.destroy({
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

module.exports = Wells;