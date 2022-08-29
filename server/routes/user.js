const {
  allUser,
  getUserById,
  deleteUser,
  updateUser,
  createNewUser,
  reset_password,
  authenticate,
  isAuthenticate,
  pagination,
  userProfile,
  forgetPassword,
  emailDatails,
  uploadProfilePic,
  updateTraveller,
  deleteTraveller
} = require("../controllers/userController");
const MESSAGE = require('../../config/message.json');
const express = require("express");
const router = express.Router();
const verifyToken = require('../helper/auth');
const { bookedTicket } = require("../model/bookedTicket");

// create newUser API
// router.post('/createUser', createNewUser);

router.post('/createUser', createNewUser);

// login user
router.post('/authenticate', authenticate);

//allUser
router.get("/allUser", allUser);

// pagination
router.get("/pagination", verifyToken, async (req, res) => {
  const { page, size } = req.query;
  let pages = parseInt(page)
  let sizes = parseInt(size)
  try {
    let result = await pagination(pages, sizes);
    if (result.error) {
      res.status(500).json({ error: true, message: result.message });
      return;
    } else {
      res.status(200).json({
        error: false,
        message: result,
      });
    }
  } catch (error) {
    res = MESSAGE.API.ERROR_INTERNAL_SERVER;
    return res;
  }
});

//findbyId
router.get("/getUser/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let result = await getUserById(id);
    if (result.error) {
      res.status(500).json({ error: true, message: result.message });
      return;
    } else {
      res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
        Type: result.TYPE,
        message: result,
      });
    }
  } catch (error) {
    return MESSAGE.API.ERROR_INTERNAL_SERVER;
  }
});

// delete user
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    let result = await deleteUser(id);
    if (result.error) {
      res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
        Result: result.message,
      });
    } else {
      res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
        Result: result,
      });
    }
  } catch (error) {
    return MESSAGE.API.ERROR_INTERNAL_SERVER
  }
});

//   udpate traveller
router.post("/updateTraveller/:id", updateTraveller);

//   udpate traveller
router.post("/deleteTraveller/:id", deleteTraveller);

//   udpate user
router.post("/update/:id", updateUser);

// reset password
router.post("/reset-password", reset_password);

// Forgot Password
router.post('/forgotPassword', forgetPassword);

// User Profile 
router.get('/profile', userProfile);

// get bookingHISTORY
router.get('/getHistory/:id', async(req, res) => {
  let id = req.params.id;
  try {
    const exist = await bookedTicket.find({user_id:id});
    console.log("getUser",exist);
    res.send({
      status: 200,
      data: exist
    });
  } catch (error) {
    res.send({
      status: 404,
      data: "Booking History is not available"
    });
  }
});
// Logout User
router.post('/logout', (req, res) => {
  req.logOut();
  res.send("loged out")
});

router.patch("/emailupdate/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let result = await emailDatails(id);
    if (result.error) {
      res =
        res.status(500).json({
          error: true,
          message: result.message,
        });
    } else {
      res = MESSAGE.USER.UPDATE.SUCCESS;
      res;
    }
  } catch (error) {
    res = MESSAGE.API.ERROR_INTERNAL_SERVER;
    return res;
  }
});

router.post("/upload-profile/:id", uploadProfilePic);

module.exports = router;
