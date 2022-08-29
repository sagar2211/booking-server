const mongoose = require("mongoose");

const seoRequest = mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    fromDate: {
        type: Object,
        required: true
    },
    toDate: {
        type: Object,
        required: true,
    },
    apiKey: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    response: {
        type: Object,
    },
    start_time: {
        type: Date,
    },
    end_time: {
        type: Date,
    },
    status: {
       type: String,
       default: "failure" 
    }
});

module.exports.seoRequest = mongoose.model("seoRequest", seoRequest);
