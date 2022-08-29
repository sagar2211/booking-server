const mongoose = require('mongoose');

const submitBookingInfo = mongoose.Schema({
  bookingObj: {
    type: Object,
    required: true,
  }
})

module.exports.submitBookingInfo = mongoose.model("submitBookingInfo", submitBookingInfo);