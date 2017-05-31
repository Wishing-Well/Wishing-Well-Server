const express = require('express');
const {Payment} = require('../../models');
const Payments = express.Router();
const stripe = require('../../server/stripeApp');

Payments.post('/create', (req, res) => {
  console.log('test1');
  stripe.accounts.create({
    country: "US",
    type: "custom"
  })
  .then(acct => {
    console.log(req.body.token)
    return stripe.charges.create({
      amount: Number(req.body.amount),
      currency: "usd",
      source: req.body.token.tokenId,
      on_behalf_of: acct.id
    });
  })
  .then(token => {
    console.log('test2');
    return Payment.create({
      amount: Number(req.body.amount),
      tokenId: token.id
    });
  })
  .then(() => {
    console.log('test3');
    res.redirect( '../users/info' );
  });
});

module.exports = Payments;