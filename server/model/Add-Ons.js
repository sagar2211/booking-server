const mongoose = require("mongoose");

const addOns = mongoose.Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    },
    currency: {
        type: String
    },
    value: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'application_user'
    }
});
const add_Ons = mongoose.model("user_role", addOns);
module.exports.add_Ons = add_Ons;
module.exports.addOns = addOns;
