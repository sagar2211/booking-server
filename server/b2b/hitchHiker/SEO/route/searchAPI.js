const router = require("express").Router();
const { searchFlights } = require("../Controller/searchAPIController");
const MESSAGE = require("../../../../../config/message.json");
const requestIp = require('request-ip');

router.post("/searchSeoFlights", async (req, res) => {
    try {
      let result = await searchFlights(req);
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