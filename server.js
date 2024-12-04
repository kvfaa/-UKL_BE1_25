

const express = require('express');
const app =express();
const port = 8080;

const cors= require('cors');
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

// Middleware

const userRoute = require('./routes/user.route');
const attendanceRoute = require('./routes/attendance.route');
const auth = require(`./routes/auth.route`)

app.use('/user', userRoute);
app.use('/present', attendanceRoute);
app.use(`/auth`, auth)

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
