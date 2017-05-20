module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: false,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: false,
    },
    first_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: false,
    },
    last_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: false,
    },
    coin_inventory: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: false,
    },
    coins_thrown: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: false,
    },
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Message, {
          as: 'Author',
        });
        User.hasMany(models.Well, {
          as: 'Organizer',
        });
        User.hasMany(models.Throw, {
          as: 'Donor',
        });
      }
    }
  });

  return User;
};