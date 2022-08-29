const router = require("express").Router();
const { flightApiSeting } = require("../controllers/FlightApiSettingsController");
const MESSAGE = require("../../../../../../config/message.json");

router.get("/api/admin/flightapi/get/:city", async (req, res) => {
  try {
    const city = req.params.city;
    let result = await flightApiSeting(city);
    if (result.error) {
      res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
        Result: result
      });
    } else {
        res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
        Result: result
      });
    }
  } catch (error) {
    return MESSAGE.API.ERROR_INTERNAL_SERVER;
  }
});

module.exports = router;