const mongoose = require("mongoose");

const travellerDetails = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    middlename: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    dob: {
        type: Object,
    },
    passport_no: {
        type: String,
    },
    passport_issue_country: {
        type: String,
    },
    passport_expiry: {
        type: String,
        required: true
    },
    frequentFlyerAirline: {
        type: Array
    },
    countryCode: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: Object,
        required: true
    },
    gstno:{
        type: String
    }
});

module.exports.travellerDetails = mongoose.model("travellerDetails", travellerDetails);
