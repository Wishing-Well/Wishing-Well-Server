module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: false,
    },
    full_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: false,
    },
    coin_inventory: {
      type: DataTypes.INTEGER,
      defaultValue: 2147483647,
      allowNull: true,
      unique: false,
    },
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Message, {
          as: 'messages',
        });
        User.hasMany(models.Well, {
          as: 'wells',
        });
        User.hasMany(models.Donation, {
          as: 'donations',
        });
      }
    }
  });

  return User;
};