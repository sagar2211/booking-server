
const mongoose = require("mongoose");
const adress = mongoose.Schema({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  account_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  account_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  updated_at: {
    allowNull: false,
    type: DataTypes.DATE,
  }
});

const Adress = mongoose.model("address", adress);
module.exports.Adress = Adress;
module.exports.adress = adress;