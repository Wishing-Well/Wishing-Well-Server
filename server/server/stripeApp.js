module.exports = () => {
  const STRIPE_KEY = require('./stripe_key');
  const stripe = require("stripe")(STRIPE_KEY);

  stripe.accounts.create({
    country: "US",
    type: "custom"
  })
  .then(acct => {
    console.log(acct);
  });
};