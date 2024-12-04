const { User } = require('../models');
const { Op } = require('sequelize');

const checkUsernameUnique = async (req, res, next) => {
    try {
        const { username } = req.body; // Mengambil username dari body request
        const { userID } = req.params;  // Mengambil userID dari parameter

        // 
        if (username) {
            // 
            const existingUser = await User.findOne({
                where: {
                    username: username,
                    id: { [Op.ne]: userID }, // cek username
                },
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken',
                });
            }
        }

        // cek username unik
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking username uniqueness',
            error: error.message,
        });
    }
};

module.exports = { checkUsernameUnique };
