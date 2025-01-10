require("dotenv").config()
const express = require("express")
const cors = require("cors")
const passport = require('passport')
require('./DB/mongo')
const path = require('path')
const app = express()
app.use(cors())
app.use(express.json())
const { scheduleCouponCron } = require('./utils/cronTasks')

const tokenRefresh=require('./Routes/RefreshToken/RefreshRoute')
const adminAuth=require('./Routes/Admin/Auth/AuthRoute')
const userAuth=require('./Routes/User/Auth/AuthRoute')
const adminCoupon = require('./Routes/Admin/coupon/couponRoute')


app.use('/token',tokenRefresh)
// admin routes
app.use('/admin/auth', adminAuth)
app.use('/admin/coupon', adminCoupon)

// user routes
app.use('/user/auth',userAuth)

scheduleCouponCron();


const PORT = 3006 || process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started listening at PORT ${PORT}`);
})