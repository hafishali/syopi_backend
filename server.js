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
const offerRoutes = require('./Routes/Admin/offer/offerRoute')
const CategoryRoutes = require('./Routes/Admin/Category/CategouryRoute');
const SubcategoryRoutes = require('./Routes/Admin/SubCategory/SubCategoryRoute');
const SliderRoutes = require('./Routes/Admin/Slider/SliderRoute');
const NotificationRoute = require('./Routes/Admin/Notification/NotificationRoute');
const chappalRoute = require('./Routes/Admin/Product/ChappalRoute')
const vendorRoute = require('./Routes/Admin/Vendor/VendorRoute');
const userRoute = require('./Routes/Admin/User/UserRoute');
const vendorAuth = require('./Routes/Vendor/Auth/AuthRoute');
const vendorCategoryRoute = require('./Routes/Vendor/Category/CategoryRoute');
const vendorSubcategoryRoute = require('./Routes/Vendor/SubCategory/SubcategoryRoute');
const vendorNotificationRoute = require('./Routes/Vendor/Notification/NotificationRoute');
const vendorSliderRoute = require('./Routes/Vendor/Slider/SliderRoute');



app.use('/token',tokenRefresh)
// admin routes

app.use('/admin/auth', adminAuth)
app.use('/admin/coupon', adminCoupon)
app.use('/admin/category', CategoryRoutes);
app.use('/admin/subcategory',SubcategoryRoutes);
app.use('/admin/slider',SliderRoutes);
app.use('/admin/notification',NotificationRoute);
app.use('/admin/chappal',chappalRoute);
app.use('/admin/offer', offerRoutes);
app.use('/admin/vendor', vendorRoute);
app.use('/admin/user', userRoute);

// admin routes
app.use('/vendor/auth', vendorAuth);
app.use('/vendor/category', vendorCategoryRoute);
app.use('/vendor/subcategory', vendorSubcategoryRoute);
app.use('/vendor/notification', vendorNotificationRoute);
app.use('/vendor/slider', vendorSliderRoute);




// user routes
app.use('/user/auth',userAuth)


scheduleCouponCron();


app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
 
const PORT = 3006 || process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started listening at PORT ${PORT}`);
})