const express = require('express');
const app = express();

app.use(express.json());
const userController = require('../controller/user.controller');
const { authorize } = require(`../controller/auth.controller`);
let { validateUser } = require('../middleware/user-validation');
//const { checkUsernameUnique } = require('../middleware/check-username-unique'); 

// Routes untuk Users
app.post('/', [validateUser, authorize], userController.addUser); // Menambahkan pengguna baru
app.get('/:userID', [authorize], userController.findByID); // Mengambil data pengguna berdasarkan ID
app.put('/:userID', [validateUser, authorize], userController.updateUser); 
app.delete('/:userID',  [authorize], userController.deleteUser); // Menghapus pengguna

// Route untuk Login
//app.post('/auth/login', userController.loginUser); // Login pengguna

module.exports = app;
