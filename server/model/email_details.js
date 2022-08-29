const mongoose = require("mongoose");

const email_details = mongoose.Schema({
  from_email: {
    type: String,
    required: true,
  },
  to_email: {
    type: String,
  },
  subject: {
    type: String,
    required: true,
  },
  cc: {
    type: String,
  },
  bcc: {
    type: String,
  },
  message_content: {
    type: Object,
    required: true,
  },
  ip_address: {
    type: String,
  },
  api_key: {
    type: String,
  },
  api_key: {
    type: String,
  },
  create_date: {
    type: Date,
  },
  last_update_date: {
    type: Date,
  },
  reply_to_email: {
    type: String,
  },
  requested_on: {
    type: Date,
  },
  sent_on: {
    type: Date,
  },
  status: {
    type: Number,
    defaultValue: 0
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'application_user'
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  }
});

const emailModel = mongoose.model("email_details", email_details);
module.exports.emailModel = emailModel;
module.exports.email_details = email_details;