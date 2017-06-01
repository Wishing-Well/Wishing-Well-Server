module.exports = function(sequelize, DataTypes) {
  var Well = sequelize.define("Well", {
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: false,
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: false,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    funding_target: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    current_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      unique: false,
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: false,
    },
    expired: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Well.hasMany(models.Donation);
        Well.hasMany(models.Message);
        Well.belongsTo(models.User);
      }
    }
  });

  return Well;
};