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
      type: DataTypes.MONEY,
      allowNull: true,
      unique: false,
    },
    current_amount: {
      type: DataTypes.MONEY,
      allowNull: true,
      unique: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
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
        Well.hasOne(models.User,{
          as: 'Organizer',
        });
      }
    }
  });

  return Well;
};