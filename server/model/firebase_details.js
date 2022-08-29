const mongoose = require("mongoose");

const firebaseDetails = mongoose.Schema({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  device_token:{
      type:DataTypes.STRING
  },
  title:{
      type:DataTypes.STRING
  },
  message_text:{
      type:DataTypes.STRING
  },
  requested_on:{
      type:DataTypes.DATE
  },
  sent_on:{
      type:DataTypes.DATE
  },
  status: {
    type: DataTypes.INTEGER,
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  api_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
});


const Firebase = mongoose.model("firebase_details", firebaseDetails);
module.exports.Firebase = Firebase;
module.exports.firebaseDetails = firebaseDetails;