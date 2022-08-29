const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const {User} = require("../model/userModel");
const bcryptLib = require("../libs/bcryptLib");
const MESSAGE = require("../../config/message.json")
passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async function (email, password, done) {
        const user = await User.findOne({email: email});
        if (user == null) {
          return done(null, false, { message: MESSAGE.USER.LOGIN.ERROR_CREDENTIALS});
        }else if ( await bcryptLib.isPasswordRight(password, user.password)) {
          return done(null, user);
        }else{
          return done(null, false, { message: MESSAGE.USER.LOGIN.ERROR_CREDENTIALS });
        }
      }
    )
  );
  
  passport.serializeUser(function (user, done) {
    if(user){
     return done(null, {id: user.id, email: user.email});
    }
    return done(null, false)
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, {id: user.id, email: user.email});
  });
