const express = require('express');
const app = express();

app.use(express.json());
const attendanceController = require('../controller/attendance.controller'); // Pastikan path sesuai struktur project
const { authorize } = require(`../controller/auth.controller`)
let { validateAttendanceInput } = require('../middleware/attendance-validation');

// Routes untuk Attendance
app.post('/', [authorize, validateAttendanceInput], attendanceController.recordAttendance); // Mencatat presensi
app.get('/find/:userID', [authorize], attendanceController.getHistory); // Melihat riwayat presensi pengguna
//app.get('/summary/:userID', attendanceController.getSummary); // Rekap kehadiran bulanan
app.get('/summary/:userID',[authorize], (req, res) => {
    const { userID } = req.params;
    const { month, year } = req.query;
    attendanceController.getSummary(req, res, userID, month, year);
});
app.get('/analysis',[authorize], attendanceController.getAnalysis); // Analisis tingkat kehadiran


module.exports = app;
