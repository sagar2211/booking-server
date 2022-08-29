const MESSAGE = require('../../config/message.json');
const express = require("express");
const router = express.Router();

// create newUser API
router.post('/subscribe-news',async (req, res) => {
    try {
      let result = await newsLetter(req.body);
      if (result.error){
        res.status(MESSAGE.API.ERROR_INTERNAL_SERVER.STATUS).json({
          Result: result,
        });
      } else {
        res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
          Result:result,
          data: result.data
        });
      }
    } catch (error) {
      return MESSAGE.API.ERROR_INTERNAL_SERVER;
    }
  });

module.exports = router;