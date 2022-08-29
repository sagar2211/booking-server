const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  user_id: {
    type: String
  },
  prefix: {
    type: String,
  },
  firstName: {
    type: String,
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String,
  },
  gender: {
    type: String,
    default:null
  },
  dateOfBirth: {
    type: Object,
    default:null
  },
  maritalStatus:{
    type:String
  },
  countryCode: {
    type: String,
  },
  mobile: {
    type: Object,
    // 
  },
  email: {
    type: String,
    isEmail: true,
    unique: true
  },
  password: {
    type: String,
    
  },
  passwordType:{
    type: String,
    
  },
  passwordExpioryTime:{
    type: Date,
    default: Date.now()
  },
  taxNo: {
    type: String,
  },
  companyName: {
    type: String,
  },
  registrationId: {
    type: Number,
  },
  documentType: {
    type: String,
  },
  documentId: {
    type: String
  },
  passportNo: {
    type: Number,
  },
  passportIssuingCountry: {
    type: String,
  },
  passportExpiry: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
  },
  is_active: {
    type: Number,
  },
  is_deleted: {
    type: Number,
  },
  lastLogin: {
    type: Date,
  },
  userType: {
    type: String
  },
  otp: {
    type: Number,
  },
  user_role_id: {
    type: Number,
  },
  firebase_details_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'firebase_details',
  },
  image_name: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'image',
    type: String,
    default : null
  },
  travellerArray : {
    type: Array
  },
  bookedTicketArray : {
    type: Array
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'country'
  },
  adress_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'address'
  },
  contactResult : {
    type: Object
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  updated_at: {
    type: Date,
    default: Date.now()
  },
});

userSchema.methods.generateAuthToken = function () {
  const info = {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, //1 day
    Data: {
      userId: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      mobile: this.mobile,
    },
  };
  return jwt.sign(info, process.env.JWTSECRET);
};

const User = mongoose.model("application_user", userSchema);
module.exports.User = User;
module.exports.userSchema = userSchema;