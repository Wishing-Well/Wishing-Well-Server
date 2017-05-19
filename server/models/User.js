module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {
      type: DataTypes.VARCHAR(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
  }, {
    classMethods: {
/*      associate: function(models) {
        User.hasMany(models.Card, {
          as: 'Creator',
        });
        User.hasMany(models.Card, {
          as: 'Assignee',
        });
      }*/
    }
  });

  return User;
};