const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/** Load model of user */
const userModel = require('../models/index').User;

/** handle authentication process */
const authenticate = async (request, response) => {
    const { username, password } = request.body;

    // Validasi input
    if (!username || !password) {
        return response.status(400).json({
            status: 'gagal',
            message: 'Username and password are required',
        });
    }

    try {
        /** Check username in user's table */
        const dataUser = await userModel.findOne({ where: { username } });

        /** If user data exists */
        if (dataUser) {
            /** Compare the provided password with the hashed password */
            const isPasswordValid = await bcrypt.compare(password, dataUser.password);

            if (isPasswordValid) {
                /** Set payload for token generation data yang bakal disimpien di jwt*/
                const payload = { id: dataUser.id, username: dataUser.username };

                /** Define secret key for signature (use an environment variable for production) */
                const secret = process.env.JWT_SECRET || 'mokleters'; // Ensure this is secure

                /** Generate token */
                const token = jwt.sign(payload, secret, { expiresIn: '1h' }); // Add expiration time for added security

                /** Send response only with token */
                return response.json({
                    status: 'sukses',
                    message: 'Login Berhasil',
                    token: token,
                });
            } else {
                return response.status(401).json({
                    status: 'gagal',
                    message: 'Password Salah',
                });
            }
        } else {
            return response.status(404).json({
                status: 'gagal',
                message: 'User tidak dapat ditemukan',
            });
        }

    } catch (error) {
        /** Handle unexpected errors */
        console.error('Error during authentication:', error); // Debugging log
        return response.status(500).json({
            status: 'gagal',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

/** Function to handle authorization */
const authorize = (request, response, next) => {
    /** Get Authorization header */
    const headers = request.headers.authorization;

    /** Extract token key */
    const tokenKey = headers && headers.split(' ')[1];

    /** Check if token exists */
    if (!tokenKey) {
        return response.status(401).json({
            status: 'gagal',
            message: 'Unauthorized User',
        });
    }

    /** Define secret key (same as in authentication function) */
    const secret = process.env.JWT_SECRET || 'mokleters';

    /** Verify token */
    jwt.verify(tokenKey, secret, (error, user) => {
        /** Handle verification error */
        if (error) {
            console.error('Invalid token:', error); // Debugging log
            return response.status(403).json({
                status: 'gagal',
                message: 'Invalid token',
            });
        }

        // /** Attach user data to request */
        // request.user = user;

        /** Proceed to the next middleware/controller */
        next();
    });
};

/** Export functions for external use */
module.exports = { authenticate, authorize };
