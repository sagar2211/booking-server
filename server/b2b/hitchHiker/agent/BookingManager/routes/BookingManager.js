const router = require("express").Router();
const MESSAGE = require("../../../../../../config/message.json");
const { booking_details } = require("../controllers/BookingManager");

router.post("/booking_details", booking_details);

module.exports = router;