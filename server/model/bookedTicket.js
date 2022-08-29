const mongoose = require('mongoose');

const bookedTicketInfo = mongoose.Schema({
  flightdata: {
    type: Object,
    required: true
  },
  bookingObj: {
    type: Object,
    required: true,
  },
  hepStarResult: {
    type: Object,
    required: true
  },
  extraService: {
    type: Object,
    require: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'application_user'
  }
});


// module.exports.bookedTicketInfo = mongoose.model("bookedTicketInfo", bookedTicketInfo);
const bookedTicket = mongoose.model("bookedTicketInfo", bookedTicketInfo);
module.exports.bookedTicket = bookedTicket;
module.exports.bookedTicketInfo = bookedTicketInfo;