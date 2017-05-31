const STRIPE_SECRET_KEY = require('./stripe_key');
const STRIPE_PUBLIC_KEY = require('./stripe_public_key');
const stripe = require("stripe")(STRIPE_SECRET_KEY);
let stripeAccount;



module.exports = stripe;