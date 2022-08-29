const router = require("express").Router();
const passport = require("passport");
const message = require("../../config/message.json");

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

// Example protected and unprotected routes
router.get("/", (req, res) => res.render("googleLogin"));
router.get("/failed", (req, res) => res.send(message.user_loggedin_failed));

// In this route you can see that if the user is logged in u can acess his info in: req.user
router.get("/gProfile", isLoggedIn, (req, res) => {
  res.render("googleProfile", {
    name: req.user.displayName,
    pic: req.user.photos[0].value,
    email: req.user.emails[0].value,
  });
});

// Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/gProfile");
  }
);

router.get("/googlelogout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

module.exports = router;
