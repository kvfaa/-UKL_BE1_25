// models/attendance.js
module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // This should match the actual table name for `User`
        key: 'id',
      },
      onDelete: 'CASCADE', // Optional: specify behavior on deletion of a user
    },
    
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Attendance.associate = function(models) {
    // Relasi user
    Attendance.belongsTo(models.User, { foreignKey: 'userID' });
  };

  return Attendance;
};
