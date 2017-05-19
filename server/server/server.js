//Init server
const app = require('./expressApp.js');
const db = require('../models');
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  db.sequelize.sync();
  console.log(`Server started on port ${PORT}`);
});

module.exports = server;