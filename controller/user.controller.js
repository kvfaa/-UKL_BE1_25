const { User } = require('../models'); // Pastikan model User diimpor dari folder models
const bcrypt = require('bcrypt'); // Untuk hashing password
const { Op } = require('sequelize'); // Pastikan Op diimpor untuk query operator Sequelize

// Add USer
exports.addUser = async (req, res) => {
    try {
        const { name, username, password, role } = req.body;

        // Hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save data
        const newUser = await User.create({
            username,
            name,
            password: hashedPassword,
            role,
        });

        const { id, name: userName, username: userUsername, role: userRole } = newUser;

        return res.status(201).json({
            success: true,
            data: { id, name: userName, username: userUsername, role: userRole },
            message: 'User has been added',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User cannot be added',
            error: error.message,
        });
    }
};

// Mengambil data pengguna berdasarkan ID
exports.findByID = async (req, res) => {
    try {
        const { userID } = req.params;

        // Cari user berdasarkan ID
        const user = await User.findByPk(userID);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
            message: 'User has been loaded',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'An error occurred',
            error: error.message,
        });
    }
};

// Mengupdate data pengguna
exports.updateUser = async (req, res) => {
    try {
        const { userID } = req.params;
        const { name, username, password, role } = req.body;

        // Mencari pengguna berdasarkan userID
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Cek jika username sudah ada di database (kecuali username yang lama)
        if (username) {
            const existingUser = await User.findOne({
                where: {
                    username: username,
                    id: { [Op.ne]: userID }, // Menghindari cek username untuk pengguna yang sama
                },
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken',
                });
            }
        }

        // Update data pengguna hanya jika ada perubahan
        const updatedUser = { name, role }; // Role yang ingin diubah
        if (username) {
            updatedUser.username = username; // Hanya tambahkan jika username diubah
        }
        if (password) {
            updatedUser.password = await bcrypt.hash(password, 10); // Hash password baru
        }

        // Update data pengguna di database
        await user.update(updatedUser);

        return res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'User has been updated',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Menghapus pengguna
exports.deleteUser = async (req, res) => {
    try {
        const { userID } = req.params;

        // cari user berdasarkan userID
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // hapus user
        await user.destroy();

        return res.status(200).json({
            success: true,
            message: 'User has been deleted',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User cannot be deleted',
            error: error.message,
        });
    }
};
