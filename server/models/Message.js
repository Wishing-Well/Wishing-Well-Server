module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define("Message", {
    message: {
      type: DataTypes.STRING(140),
      allowNull: false,
    }
  }, {
    classMethods: {
      associate: function(models) {
        Message.belongsTo(models.User);
        Message.belongsTo(models.Well);
      }
    }
  });

  return Message;
};