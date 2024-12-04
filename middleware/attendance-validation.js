const Joi = require('joi');

// Middleware untuk validasi input presensi
const validateAttendanceInput = (req, res, next) => {
    // Definisi aturan validasi
    const schema = Joi.object({
        userID: Joi.number().integer().required(),
        date: Joi.date().iso().required(), // Tanggal dalam format YYYY-MM-DD
        time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(), // Format waktu HH:MM
        status: Joi.string()
            .valid('Hadir', 'Tidak Hadir', 'Izin', 'Sakit', 'Alpha') // Nilai status yang diperbolehkan
            .required()
    })
    .options({ abortEarly: false }); // Tampilkan semua kesalahan sekaligus

    // Lakukan validasi
    const { error } = schema.validate(req.body);

    if (error) {
        // Format pesan error
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(422).json({
            success: false,
            message: errorMessage
        });
    }

    // Lanjutkan ke middleware/handler berikutnya jika validasi lolos
    next();
};

module.exports = { validateAttendanceInput };
