const mongoose = require("mongoose");
const authmodels = mongoose.Schema({
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "application_user",
  },
  user_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  account_type: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
});

const AuthModel = mongoose.model("auth_models", authmodels);
module.exports.AuthModel = AuthModel;
module.exports.authmodels = authmodels;
