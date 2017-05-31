module.exports = function(sequelize, DataTypes) {
  var Payment = sequelize.define("Payment", {
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tokenId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Payment.belongsTo(models.User);

      }
    }
  });

  return Payment;
};