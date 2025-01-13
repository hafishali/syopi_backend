const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type:String
    },
    description: {
        type: String,
        required: true
    },
    datetime: {
        type: Date,
        required: true
    },
},{ timestamps: true })

const Notification = mongoose.model('Notification',notificationSchema);

module.exports = Notification;