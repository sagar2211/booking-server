const mongoose = require("mongoose");

const searchRequest = mongoose.Schema({
    reqObj: {
        type: Object,
        required: true,
    }
});

module.exports.searchRequest = mongoose.model("searchRequest", searchRequest);