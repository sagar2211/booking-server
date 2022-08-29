const router = require("express").Router();
const passport = require("passport");
const message = require("../../config/message.json");
var newData = []

router.get("/fbProfile", isLoggedIn, (req, res) =>{
  res.render("facebookProfile", {
    id: req.user.id, // get the user out of session and pass to template.
    name: req.user.displayName,
  });
});

router.get("/failed", (req, res) => res.send(message.user_loggedin_failed));
// route middleware to make sure
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  // if they aren't redirect them to the home page
  res.redirect("/facebook/facebookAuth");
}

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);

router.get("/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/fbProfile");
  }
);

router.get("/facebookAuth", function (req, res) {
  res.render("facebookLogin"); // load the index.ejs file
});

router.get("/facebooklogout", function (req, res) {
  req.logout();
  res.redirect("/facebookAuth");
});

module.exports = router;
