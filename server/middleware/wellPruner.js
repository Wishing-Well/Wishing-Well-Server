// Middleware for the purpose of pruning any existing wells which have passed their expiration dates
module.exports = (req, res, next) => {
  const { Well } = require('../models');

  Well.update({
    expired: true
  }, {
    where: {
      expiration_date: {
        lte: new Date()
      }
    }
  })
  .then( () => { next(); });
};