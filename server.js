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
require('./Configs/passportConfigGoogle')

const tokenRefresh=require('./Routes/RefreshToken/RefreshRoute')
const adminAuth=require('./Routes/Admin/Auth/AuthRoute')
const userAuth=require('./Routes/User/Auth/AuthRoute')
const adminCoupon = require('./Routes/Admin/coupon/couponRoute')
const offerRoutes = require('./Routes/Admin/offer/offerRoute')
const CategoryRoutes = require('./Routes/Admin/Category/CategouryRoute');
const SubcategoryRoutes = require('./Routes/Admin/SubCategory/SubCategoryRoute');
const SliderRoutes = require('./Routes/Admin/Slider/SliderRoute');
const NotificationRoute = require('./Routes/Admin/Notification/NotificationRoute');
const chappalRoute = require('./Routes/Admin/Product/ChappalRoute')
const UserCategories=require('./Routes/User/Category/CategoryRoute')
const UserSubCategories=require('./Routes/User/SubCategory/SubCategoryRoute')




app.use('/token',tokenRefresh)
app.use(passport.initialize())
// admin routes

app.use('/admin/auth', adminAuth)
app.use('/admin/coupon', adminCoupon)
app.use('/admin/category', CategoryRoutes);
app.use('/admin/subcategory',SubcategoryRoutes);
app.use('/admin/slider',SliderRoutes);
app.use('/admin/notification',NotificationRoute);
app.use('/admin/chappal',chappalRoute);
app.use('/admin/offer', offerRoutes)




// user routes
app.use('/user/auth',userAuth)
app.use('/user/categories',UserCategories)
app.use('/user/Subcategories',UserSubCategories)


scheduleCouponCron();


app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
 
const PORT = 3006 || process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started listening at PORT ${PORT}`);
})