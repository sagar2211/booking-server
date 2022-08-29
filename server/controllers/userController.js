const passport = require("passport");
const winstonLogger = require("../libs/winstonLib");
const isEmpty = require("../libs/checkLib");
const { sendmail } = require("../utils/email");
const { User } = require("../model/userModel");
const { emailModel } = require("../model/email_details");
const bcryptLib = require("../libs/bcryptLib");
const MESSAGE = require("../../config/message.json");
const moment = require("moment");
const store = require("store2");
const _ = require("lodash");
const multer = require("multer");
const { bookedTicket } = require('../model/bookedTicket')
const { createContact, searchContact, updateContact } = require("../sugar-crm/controllers/sugarcrm");

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "server/public/upload_images/");
  },
  filename: (req, file, callback) => {
    const match = ["image/png", "image/jpeg"];
    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
      return callback(message, null);
    }
    var filename = `${Date.now()}-${file.originalname}`;
    callback(null, filename);
  },
});
var uploadProfile = multer({ storage: storage }).single("profile-upload");

exports.createNewUser = async (req, res) => {
  let user = req.body;
  const is_active = 1;
  const is_deleted = 0;
  const passwordType = "permanent";
  try {
    let oldUser = await User.find({ email: user.email });
    if (!isEmpty(oldUser)) {
      winstonLogger.info(MESSAGE.USER.ADD.ERROR_USER_EXISTS);
      res.send({
        type: MESSAGE.USER.ADD.ERROR_USER_EXISTS.TYPE,
        status: MESSAGE.USER.ADD.ERROR_USER_EXISTS.STATUS,
        message: MESSAGE.USER.ADD.ERROR_USER_EXISTS.MESSAGE,
      });
    }
    const password = await bcryptLib.generateHashedPassword(user.password);
    let cnt = 0;
    let timeInt
    let searchResult = await searchContact(user);
    var contactResult;
    if(searchResult && searchResult.data.length > 0){
      contactResult = await updateContact(searchResult.data[0]);
    } else {
      contactResult = await createContact(user);
    }
    // for(let i = 1; i<=100; i++){
    //   user.email = "test"+i+"@gmail.com"
    //   user.i = i;
    //   let contactInfo = await createContact(user);
    //   if(i === 1){
    //     timeInt = setInterval(() => {
    //       cnt +=1;
    //     }, 1000);
    //   }
    //   if(i===100){
    //     console.log("second === ",cnt);
    //    clearInterval(timeInt); 
    //   }
    // }
    console.log("contactResult === ",contactResult);
    if(contactResult.status){
      let newUser = new User({
        prefix: user.prefix,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        countryCode: user.countryCode,
        mobile: user.mobile,
        email: user.email,
        password: password,
        passwordType: passwordType,
        taxNo: user.taxNo,
        companyName: user.companyName,
        registrationId: user.registrationId,
        documentType: user.documentType,
        documentId: user.documentId,
        passportNo: user.passportNo,
        passportIssuingCountry: user.passportIssuingCountry,
        passportExpiry: user.passportExpiry,
        contactResult : contactResult.data,
        isVerified: user.isVerified,
        is_active: is_active,
        is_deleted: is_deleted
      });
  
      await newUser.save().then((result) => {
        let template = "Welcome to Wadiia";
        const user_id = result._id;
        let user = newUser.toObject();
        sendmail(
          result.firstName + " " + result.lastName,
          result.email,
          password,
          user_id,
          template
        ).then(done => {
          // console.log(done);
        });
        delete user.password;
        winstonLogger.info({
          message: MESSAGE.USER.ADD.SUCCESS,
          userInfo: user,
        });
        // return {
        //     type: MESSAGE.USER.ADD.SUCCESS.TYPE,
        //     status: MESSAGE.USER.ADD.SUCCESS.STATUS,
        //     message: MESSAGE.USER.ADD.SUCCESS.MESSAGE,
        //   }
        res.send({
          type: MESSAGE.USER.ADD.SUCCESS.TYPE,
          status: MESSAGE.USER.ADD.SUCCESS.STATUS,
          message: MESSAGE.USER.ADD.SUCCESS.MESSAGE,
        });
      })
        .catch((error) => {
          winstonLogger.info({
            status: MESSAGE.API.ERROR_INTERNAL_SERVER.STATUS,
            // message: MESSAGE.API.ERROR_INTERNAL_SERVER.MESSAGE + " " + error,
          });
          res.send({
            type: MESSAGE.API.ERROR_INTERNAL_SERVER.TYPE,
            status: MESSAGE.API.ERROR_INTERNAL_SERVER.STATUS,
            // message: MESSAGE.API.ERROR_INTERNAL_SERVER.MESSAGE + " " + error,
          });
        });
    } else {
      res.send({
        type: MESSAGE.API.ERROR_INTERNAL_SERVER.TYPE,
        status: MESSAGE.API.ERROR_INTERNAL_SERVER.STATUS,
        // message: MESSAGE.API.ERROR_INTERNAL_SERVER.MESSAGE + " " + error,
      });
    }
    
  } catch (error) {
    console.log("Welcome in catch");
    res.send({
      type: MESSAGE.API.ERROR_INTERNAL_SERVER.TYPE,
      status: MESSAGE.API.ERROR_INTERNAL_SERVER.STATUS,
    });
  }
};

module.exports.authenticate = async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  const authUser = await User.findOne({ email: email });
  if (authUser == null)
    return res.status(400).json({
      message: MESSAGE.USER.LOGIN.ERROR_CREDENTIALS,
    });
  if (authUser.passwordType == "temporary") {
    const currentTime = new Date();
    const diffInMs = Math.abs(currentTime - authUser.passwordExpioryTime);
    const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    const passwordTime = diffInMs / (1000 * 60 * 60);
    const time = passwordTime.toString();
    if (time <= 1 && days == 1) {
      passport.authenticate("local", function (err, user, info) {
        if (err) {
          return res.status(400).json(err);
        } else if (user) {
          const token = user.generateAuthToken();
          return res.status(200).json({
            user: user,
            token: token,
          });
        } else {
          return res.status(404).json(info);
        }
      })(req, res, next);
    } else {
      return res.status(MESSAGE.USER.LOGIN.ERROR_EXPIRE_PASSWORD.STATUS).json({
        message: MESSAGE.USER.LOGIN.ERROR_EXPIRE_PASSWORD.MESSAGE,
      });
    }
  } else {
    passport.authenticate("local", async function (err, user, info) {
      if (err) {
        return res.status(400).json(err);
      } else if (user) {
        const token = user.generateAuthToken();
        if (user.bookedTicketArray.length) {
          var ticketArray = [];
          await Promise.all(user.bookedTicketArray.map(async (id) => {
            const exist = await bookedTicket.findById(id);
            if (exist) {
              ticketArray.push(exist);
              console.log(exist);
            } else {
              console.log(`Id ${id} does not exist`)
            }
          }))
        }
        return res.status(200).json({
          expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
          user: user,
          token: token,
          ticketArray: ticketArray
        });
      } else {
        return res.status(404).json(info);
      }
    })(req, res, next);
  }
};

getBookingInfo = async (user) => {
  var ticketArray = [];
  return _.map(user.bookedTicketArray, async (id, indx) => {
    await bookedTicket.findById(id).then((data) => {
      if (data) {
        ticketArray.push(data);
      }
    });
    if (indx === user.bookedTicketArray.length - 1) {
      return ticketArray;
    }
  })
}

// get all user
exports.allUser = async (req, res) => {
  try {
    let getUser = await User.find({ is_active: 1 });
    res.send({
      data: getUser,
    });
  } catch (error) {
    req.send(MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS);
  }
};

// paginations
exports.pagination = async (page, size) => {
  try {
    let getUser = await User.find({ is_active: 1 })
      .limit(size * 1)
      .skip(page - 1);
    return {
      error: false,
      data: getUser,
    };
  } catch (error) {
    return MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS;
  }
};

//   get user by Id
exports.getUserById = async (id) => {
  try {
    let getUser = await User.findById(id);
    return {
      Type: MESSAGE.USER.ADD.SUCCESS.TYPE,
      Data: getUser,
    };
  } catch (error) {
    return MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS;
  }
};

// delete user
exports.deleteUser = async (id) => {
  try {
    let DeleteUser = await User.findById(id);
    if (isEmpty(DeleteUser)) {
      winstonLogger.info(MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS.MESSAGE);
      return MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS;
    }
    let user = await User.findByIdAndUpdate(id, {
      is_active: 0,
      is_deleted: 1,
      updated_at: new Date(),
    });
    return MESSAGE.USER.DELETE.SUCCESS;
  } catch (error) {
    winstonLogger.info(MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS);
    return MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS;
  }
};

// update Traveller
exports.updateTraveller = async (req, res) => {
  let user = req.body;
  let userid = req.params.id;
  var currentIndx

  var userInfo = await User.findById(userid);
  _.map(userInfo.travellerArray, (itr, indx) => {
    if (user.email === itr.email)
      currentIndx = indx
  })
  userInfo.travellerArray[currentIndx] = user;
  userInfo.save().then(userData => {
    res.status(200)
      .send({
        result: userData,
        TYPE: MESSAGE.USER.UPDATE.SUCCESS,
        STATUS: MESSAGE.USER.UPDATE.STATUS,
        MESSAGE: MESSAGE.USER.UPDATE.MESSAGE,
      });
    res.end();
  })
};

// delete Traveller
exports.deleteTraveller = async (req, res) => {
  let user = req.body;
  let userid = req.params.id;
  var currentIndx

  var userInfo = await User.findById(userid);
  _.map(userInfo.travellerArray, (itr, indx) => {
    if (user.email === itr.email && indx !== 'undefined') {
      currentIndx = indx
    }
  })

  userInfo.travellerArray.splice(currentIndx, 1);
  userInfo.save().then(userData => {
    res.status(200)
      .send({
        result: userData,
        TYPE: MESSAGE.USER.UPDATE.SUCCESS,
        STATUS: MESSAGE.USER.UPDATE.STATUS,
        MESSAGE: MESSAGE.USER.UPDATE.MESSAGE,
      });
    res.end();
  })
};

// update user
exports.updateUser = async (req, res) => {
  let user = req.body;
  let userid = req.params.id;

  await User.findByIdAndUpdate(
    userid,
    {
      $push: {
        travellerArray: user.travellerObj,
      },
      $set: {
        prifix: user.prefix,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        countryCode: user.countryCode,
        mobile: user.mobile,
        email: user.email,
        taxNo: user.taxNo,
        companyName: user.companyName,
        registrationId: user.registrationId,
        documentType: user.documentType,
        documentId: user.documentId,
        passportNo: user.passportNo,
        passportIssuingCountry: user.passportIssuingCountry,
        passportExpiry: user.passportExpiry,
        is_active: 1,
        is_deleted: 0,
        updated_at: new Date(),
      },
    },
    { new: true }
  ).then((userData) => {
    res.status(200)
      .send({
        result: userData,
        TYPE: MESSAGE.USER.UPDATE.SUCCESS,
        STATUS: MESSAGE.USER.UPDATE.STATUS,
        MESSAGE: MESSAGE.USER.UPDATE.MESSAGE,
      });
    res.end();
  });
};

// update user
// exports.updateUser = async (req, res) => {
//   var user = JSON.parse(req.headers.userobj);
//   let userid = req.params.id;
//   uploadProfile(req, res, async (err) => {
//     var files_obj = req.file;
//     await User.findByIdAndUpdate(
//       userid,
//       {
//         $set: {
//           prifix: user.prifix,
//           firstName: user.firstName,
//           middleName: user.middleName,
//           lastName: user.lastName,
//           gender: user.gender,
//           dateOfBirth: user.dateOfBirth,
//           countryCode: user.countryCode,
//           mobile: user.mobile,
//           email: user.email,
//           taxNo: user.taxNo,
//           companyName: user.companyName,
//           registrationId: user.registrationId,
//           documentType: user.documentType,
//           documentId: user.documentId,
//           passportNo: user.passportNo,
//           passportIssuingCountry: user.passportIssuingCountry,
//           passportExpiry: user.passportExpiry,
//           image_name: files_obj.filename,
//           is_active: 1,
//           is_deleted: 0,
//           updated_at: new Date(),
//         },
//       },
//       { new: true }
//     ).then((userData) => {

//       res.status(200)
//         .send({
//           result: userData,
//           TYPE: MESSAGE.USER.UPDATE.SUCCESS,
//           STATUS: MESSAGE.USER.UPDATE.STATUS,
//           MESSAGE: MESSAGE.USER.UPDATE.MESSAGE,
//         });
//       res.end();
//     });
//   });
// };

// User Profile

module.exports.userProfile = async (req, res, done) => {
  if (req.user != undefined) {
    let id = req.user._id;
    let getUser = await User.findById(id);
    res.send(getUser);
  } else {
    res.send(MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS);
  }
};

// Forget Password
exports.forgetPassword = async (req, res) => {
  let email = req.body.email;
  if (email == undefined)
    return res.send(MESSAGE.USER.FORGOT_PASSWORD.ERROR_VALID_EMAIL);
  var user = await User.findOne({ email: email });
  try {
    if (user == null) {
      winstonLogger.error(MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS);
      res.send(MESSAGE.USER.LOGIN.ERROR_USER_NOT_EXISTS);
      return;
    } else {
      let id = user._id;
      let template = "Password Reset";
      let getUser = await User.findById(id);
      var genratePassword;
      var password;
      var oldpassword;
      var oldEncryptPassword;
      // for send new password after 30 min
      let pwdExpTime = moment(getUser.passwordExpioryTime);
      let newTime = moment(new Date());
      var minutes = newTime.diff(pwdExpTime, "minutes");
      oldpassword = store.getAll();
      if (minutes <= 30 && oldpassword.old) {
        genratePassword = oldpassword.old;
        password = oldEncryptPassword;
        sendmail(
          getUser.firstName + " " + getUser.lastName,
          getUser.email,
          genratePassword,
          id,
          template
        ).then((result) => {
          res.send(MESSAGE.USER.FORGOT_PASSWORD.SUCCESS);
        });
        res.send(MESSAGE.USER.FORGOT_PASSWORD.SUCCESS);
      } else {
        genratePassword = generatePassword();
        password = await bcryptLib.generateHashedPassword(genratePassword);
        store.setAll({ old: genratePassword });
        try {
          await User.findOneAndUpdate(
            { _id: id },
            {
              $set: {
                password: password,
                passwordType: "temporary",
                passwordExpioryTime: new Date(),
                updated_at: new Date(),
              },
            }
          );
          sendmail(
            getUser.firstName + " " + getUser.lastName,
            getUser.email,
            genratePassword,
            id,
            template).then((result) => {
              res.send(MESSAGE.USER.FORGOT_PASSWORD.SUCCESS);
            });
        } catch (error) {
          winstonLogger.error(error);
          res.send(MESSAGE.USER.FORGOT_PASSWORD.ERROR_USER_NOT_EXISTS);
        }
      }
    }
  } catch (error) {
    res.send(error);
  }
};

// Reset Password
exports.reset_password = async (req, res) => {
  const email = req.body.email;
  const password = req.body.current_password;
  const newPassword = req.body.newPassword;
  const user = await User.findOne({ email: email });
  if (!isEmpty(user)) {
    if (await bcryptLib.isPasswordRight(password, user.password)) {
      const incrptPassword = await bcryptLib.generateHashedPassword(
        newPassword
      );
      User.findOneAndUpdate(
        { email: email },
        {
          $set: {
            password: incrptPassword,
            passwordType: "permanent",
          },
        }
      )
        .then((result) => {
          res.json(MESSAGE.USER.RESET_PASSWORD.SUCCESS);
        })
        .catch((error) => {
          res.json({
            status: MESSAGE.API.ERROR_INTERNAL_SERVER.STATUS,
            message: MESSAGE.API.ERROR_INTERNAL_SERVER.MESSAGE + error,
          });
        });
    } else {
      res.json(MESSAGE.USER.RESET_PASSWORD.ERROR_INCURRECT_PASSWORD);
    }
  }
};

// genrate Password
function generatePassword() {
  var len = 8;
  var arr = process.env.GENRATE_PASSWORD;
  var ans = "";
  for (var i = len; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
}

// Check Authentication
exports.isAuthenticate = (req, res, done) => {
  if (req.user) {
    return done();
  }
  return res.send(MESSAGE.JWT.ERROR_UNAUTHORIZED_USER);
};

// emailDatails
exports.emailDatails = async (email_id) => {
  try {
    let result = await emailModel.findByIdAndUpdate(
      email_id,
      {
        $set: {
          status: 1,
        },
      },
      { new: true }
    );
    return MESSAGE.USER.UPDATE.SUCCESS;
  } catch (error) {
    return MESSAGE.API.ERROR_INTERNAL_SERVER;
  }
};

exports.uploadProfilePic = (req, res) => {
  var userid = req.params.id;
  uploadProfile(req, res, async (err) => {
    var files_obj = req.file;
    try {
      await User.findByIdAndUpdate(
        userid,
        {
          $set: {
            image_name: files_obj.filename,
          }
        }, { new: true }).then((userData) => {
          res.status(200).send({
            staus: "success",
            result: userData,
            response: "profile updated successfully"
          });
          res.end();
        });
    } catch (error) {
      res.status(400).send({
        staus: "error",
        response: "Something Went Wrong"
      });
    }
  });
};

genrateUserObj = (userData) => {

  let spaceCount = userData.fullName.length - userData.fullName.replace(/\s+/g, '').length
  if (spaceCount === 2) {
    let fname = userData.fullName.split(' ')[0];
    let mname = userData.fullName.split(' ')[1];
    let lname = userData.fullName.split(' ')[2];
  } else {
    let fname = userData.fullName.split(' ')[0];
    let lname = userData.fullName.split(' ')[1];
  }
}