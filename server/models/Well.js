module.exports = function(sequelize, DataTypes) {
  var Well = sequelize.define("Well", {
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: false,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: false,
    },
    funding_target: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      unique: false,
    },
    current_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
      unique: false,
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: true,
      unique: false,
    },
  }, {
    classMethods: {
      associate: function(models) {
        Well.hasMany(models.Throw);
        Well.hasOne(models.Message);
        Well.belongsTo(models.User,{
          as: 'Organizer',
        });
      }
    }
  });

  return Well;
};