module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically increment the ID field
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // Menambahkan validasi agar hanya 'karyawan' atau 'admin' yang diterima
        isIn: {
          args: [['karyawan', 'siswa']], // Nilai yang valid untuk 'role'
          msg: 'Role hanya bisa "karyawan" atau "siswa"',
        },
      },
    },
  });

  User.associate = function(models) {
    // Definisikan relasi jika ada
    User.hasMany(models.Attendance, { foreignKey: 'userID' });
  };

  return User;
};
