const { Attendance, User } = require('../models');
const { Op, Sequelize } = require('sequelize'); // Sequelize untuk operasi database

const attendanceController = {
  /**
   * 1. Mencatat Presensi
   */
  async recordAttendance(req, res) {
    try {
      const { userID, date, time, status } = req.body;

      // Validasi apakah pengguna ada
      const user = await User.findByPk(userID);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Pengguna tidak ditemukan' 
        });
      }

      // Catat presensi
      const attendance = await Attendance.create({ userID, date, time, status });

      return res.status(201).json({
        success: true,
        message: 'Kehadiran berhasil dicatat',
        data: attendance,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message,
      });
    }
  },

  /**
   * 2. history
   */
  async getHistory(req, res) {
    try {
      const { userID } = req.params;

      // cek
      const user = await User.findByPk(userID);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Pengguna tidak ditemukan' 
        });
      }

      // get dta
      const history = await Attendance.findAll({
        where: { userID },
        order: [['date', 'DESC'], ['time', 'DESC']],
      });

      if (history.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Riwayat presensi tidak ditemukan',
        });
      }

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message,
      });
    }
  },

  /**
 * 3. recap
 */
async getSummary(req, res) {
  try {
    const { userID } = req.params;
    let { month, year } = req.query;

    // Trim any whitespace or newline characters
    month = month.trim();
    year = year.trim();

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Parameter bulan dan tahun diperlukan',
      });
    }

    // Validasi apakah pengguna ada
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan',
      });
    }

    // Ambil data kehadiran dalam bulan tertentu
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    const summary = await Attendance.findAll({
      where: {
        userID,
        date: {
          [Op.gte]: startDate, // Start date from the beginning of the month
          [Op.lte]: endDate,   // End date to cover the whole month
        },
      },
    });

    // Initialize counts for different attendance statuses
    const attendanceSummary = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
    };

    summary.forEach((record) => {
      if (record.status === 'Hadir') {
        attendanceSummary.hadir++;
      } else if (record.status === 'Izin') {
        attendanceSummary.izin++;
      } else if (record.status === 'Sakit') {
        attendanceSummary.sakit++;
      } else if (record.status === 'Alpa') {
        attendanceSummary.alpa++;
      }
    });

    return res.status(200).json({
      status: "success",
      data: {
        user_id: userID,
        month: `${month}-${year}`,  // Clean month and year formatting
        attendance_summary: attendanceSummary,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
},

  /**
 * 4. Analisis
 */
async getAnalysis(req, res) {
  try {
    const { start_date, end_date, category } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter start_date dan end_date diperlukan',
      });
    }

    // Ambil data kategori
    const analysis = await Attendance.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      where: {
        date: {
          [Op.between]: [start_date, end_date],
        },
      },
      include: [
        {
          model: User,
          attributes: ['id', 'role'], // Sertakan id dan role pengguna
          where: category ? { role: category } : {}, // Filter kategori jika ada
        },
      ],
      group: ['status', 'User.role'],
    });

    // Proses format
    const groupedAnalysis = analysis.reduce((result, record) => {
      const group = record.User.role;
      const status = record.status;

      if (!result[group]) {
        result[group] = {
          group,
          total_users: 0,
          attendance_rate: {
            hadir_percentage: 0,
            izin_percentage: 0,
            sakit_percentage: 0,
            alpa_percentage: 0,
          },
          total_attendance: {
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpa: 0,
          },
        };
      }

      // Hitung total
      result[group].total_attendance[status.toLowerCase()] += parseInt(record.dataValues.count);
      result[group].total_users += 1;

      return result;
    }, {});

   // Hitung persentase
Object.values(groupedAnalysis).forEach((group) => {
  const total = Object.values(group.total_attendance).reduce((sum, val) => sum + val, 0);

  if (total > 0) {
    group.attendance_rate.hadir_percentage = parseFloat((group.total_attendance.hadir / total * 100).toFixed(2));
    group.attendance_rate.izin_percentage = parseFloat((group.total_attendance.izin / total * 100).toFixed(2));
    group.attendance_rate.sakit_percentage = parseFloat((group.total_attendance.sakit / total * 100).toFixed(2));
    group.attendance_rate.alpa_percentage = parseFloat((group.total_attendance.alpa / total * 100).toFixed(2));
  }
});

    return res.status(200).json({
      status: 'success',
      data: {
        analysis_period: {
          start_date,
          end_date,
        },
        grouped_analysis: Object.values(groupedAnalysis),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
},
};

module.exports = attendanceController;
