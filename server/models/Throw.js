module.exports = function(sequelize, DataTypes) {
  var Throw = sequelize.define("Throw", {
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      default: false,
      allowNull: false,
    }
  }, {
    classMethods: {
      associate: function(models) {
        Throw.belongsTo(models.User);
        Throw.belongsTo(models.Well);

      }
    }
  });

  return THrow;
};