const Joi = require('joi');
const { User } = require('../models'); // Pastikan Anda mengimpor model User

const validateUser = async (request, response, next) => {
    // Define validation rules
    const rules = Joi.object({
        name: Joi.string().required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).required(),
    })
    .options({ abortEarly: false }) // Show all errors
    .unknown(true); // Allow extra fields not in the schema

    // Validate the request body
    const { error } = rules.validate(request.body);

    if (error) {
        // Format and return validation errors
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return response.status(422).json({
            success: false,
            message: errorMessage,
        });
    }

    // Check if the username already exists in the database (only if it's a create operation)
    try {
        let existingUser;
        if (request.params.id) {
            // This is an update operation. Check if the username is being updated and is unique
            existingUser = await User.findOne({ where: { username: request.body.username, id: { [Op.ne]: request.params.id } } });
        } else {
            // This is a create operation. Check if the username already exists
            existingUser = await User.findOne({ where: { username: request.body.username } });
        }

        if (existingUser) {
            return response.status(400).json({
                success: false,
                message: 'Username already taken',
            });
        }

        // Proceed to the next middleware if validation passes and username is unique
        next();
    } catch (dbError) {
        return response.status(500).json({
            success: false,
            message: 'Database error occurred while checking username',
            error: dbError.message,
        });
    }
};

module.exports = { validateUser };
