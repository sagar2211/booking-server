const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userRole = mongoose.Schema({
  user_id: {
    type: DataTypes.BIGINT,
    foreignKey: true,
    references: {
      model: "application_users",
      key: "user_id",
    }
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  created_at: {
    type: DataTypes.DATE,
  },
  updated_at: {
    type: DataTypes.DATE,
  }
});


const user_role = mongoose.model("user_role", userRole);
module.exports.user_role = user_role;
module.exports.userRole = userRole;
