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
const vendorRoute = require('./Routes/Admin/Vendor/VendorRoute');
const userRoute = require('./Routes/Admin/User/UserRoute');
const vendorAuth = require('./Routes/Vendor/Auth/AuthRoute');
const vendorCategoryRoute = require('./Routes/Vendor/Category/CategoryRoute');
const vendorSubcategoryRoute = require('./Routes/Vendor/SubCategory/SubcategoryRoute');
const vendorNotificationRoute = require('./Routes/Vendor/Notification/NotificationRoute');
const vendorSliderRoute = require('./Routes/Vendor/Slider/SliderRoute');
const dressRoute = require('./Routes/Admin/Product/DressRoute')
const UserCategories=require('./Routes/User/Category/CategoryRoute')
const UserSubCategories=require('./Routes/User/SubCategory/SubCategoryRoute')
const userProducts=require('./Routes/User/Products/Products')
const vendorProductRoute = require('./Routes/Vendor/Product/productRoute')
const vendorOfferRoute = require('./Routes/Vendor/Offer/OfferRoute')
const vendorCouponRoute = require('./Routes/Vendor/Coupon/couponRoute');
const userWishlistRoute = require('./Routes/User/Wishlist/WishlistRoute');
const adminWishlistRoute = require('./Routes/Admin/Wishlist/WishlistRoute');
const vendorWishlistRoute = require('./Routes/Vendor/Wishlist/WishlistRoute');
const userAddressRoute = require('./Routes/User/Address/addressRoute');
const adminProfileRoute = require('./Routes/Admin/Profile/profileRoute');
const userProfileRoute = require('./Routes/User/Profile/profileRoute');
const vendorProfileRoute = require('./Routes/Vendor/Profile/profileRoute');



app.use('/token',tokenRefresh)
app.use(passport.initialize())

// admin routes
app.use('/admin/auth', adminAuth)
app.use('/admin/coupon', adminCoupon)
app.use('/admin/category', CategoryRoutes);
app.use('/admin/subcategory',SubcategoryRoutes);
app.use('/admin/slider',SliderRoutes);
app.use('/admin/notification',NotificationRoute);
app.use('/admin/vendor', vendorRoute);
app.use('/admin/user', userRoute);
app.use('/admin/product/chappal',chappalRoute);
app.use('/admin/product/dress',dressRoute);
app.use('/admin/offer', offerRoutes)
app.use('/admin/wishlist', adminWishlistRoute)
app.use('/admin/profile', adminProfileRoute)


// vendor
app.use('/vendor/auth', vendorAuth);
app.use('/vendor/category', vendorCategoryRoute);
app.use('/vendor/subcategory', vendorSubcategoryRoute);
app.use('/vendor/notification', vendorNotificationRoute);
app.use('/vendor/slider', vendorSliderRoute);
app.use('/vendor/product', vendorProductRoute)
app.use('/vendor/offer', vendorOfferRoute)
app.use('/vendor/coupon', vendorCouponRoute)
app.use('/vendor/wishlist', vendorWishlistRoute)
app.use('/vendor/profile', vendorProfileRoute)





// user routes
app.use('/user/auth',userAuth)
app.use('/user/categories',UserCategories)
app.use('/user/Subcategories',UserSubCategories)
app.use('/user/Products',userProducts)
app.use('/user/wishlist',userWishlistRoute)
app.use('/user/address',userAddressRoute)
app.use('/user/profile',userProfileRoute)


scheduleCouponCron();


app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
 
const PORT = 3006 || process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started listening at PORT ${PORT}`);
})