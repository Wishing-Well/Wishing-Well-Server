module.exports = function(sequelize, DataTypes) {
  var Donation = sequelize.define("Donation", {
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models) {
        Donation.belongsTo(models.User);
        Donation.belongsTo(models.Well);

      }
    }
  });

  return Donation;
};