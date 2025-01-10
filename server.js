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
const adminCategory=require('./Routes/Admin/Category/CategouryRoute')
const userAuth=require('./Routes/User/Auth/AuthRoute')
const adminCoupon = require('./Routes/Admin/coupon/couponRoute')

const CategoryRoutes = require('./Routes/Admin/Category/CategouryRoute');
const SubcategoryRoutes = require('./Routes/Admin/SubCategory/SubCategoryRoute');



app.use('/token',tokenRefresh)
// admin routes

app.use('/admin/auth', adminAuth)
<<<<<<< HEAD
<<<<<<< HEAD
app.use('/admin/coupon', adminCoupon)
=======
=======

app.use('/admin/coupon', adminCoupon)
>>>>>>> 367c68b29fda1c593976f73538097bc49941a24e
app.use('/admin/category', CategoryRoutes);
app.use('/admin/subcategory',SubcategoryRoutes);


<<<<<<< HEAD
>>>>>>> c45c3fc8db1c664a1324dffc7f91951fe3eda9ab
=======
>>>>>>> 367c68b29fda1c593976f73538097bc49941a24e

// user routes
app.use('/user/auth',userAuth)

<<<<<<< HEAD
<<<<<<< HEAD
scheduleCouponCron();


=======


app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
>>>>>>> c45c3fc8db1c664a1324dffc7f91951fe3eda9ab
=======

scheduleCouponCron();



app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

>>>>>>> 367c68b29fda1c593976f73538097bc49941a24e
const PORT = 3006 || process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started listening at PORT ${PORT}`);
})