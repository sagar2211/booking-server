const isEmpty = require('../libs/checkLib');
const jwt = require('jsonwebtoken');
const winLogger = require('../libs/winstonLib');
const MESSAGE = require('../../config/message.json');
module.exports = (req, res, next) => {
  if (isEmpty(req.headers['x-access-token'])) {
    winLogger.error(MESSAGE.JWT.ERROR_TOKEN_NOT_FOUND);
    res = MESSAGE.JWT.ERROR_TOKEN_NOT_FOUND;
    return res;
  } else {
    try {
      const token = jwt.verify(
        req.headers['x-access-token'],
        process.env.JWTSECRET
      );
      req.userId = token.Data.userId;
      winLogger.info(req.userId);
      next();
    } catch (err) {
      winLogger.error(MESSAGE.JWT.ERROR_INVALID_TOKEN);
      res = MESSAGE.JWT.ERROR_INVALID_TOKEN;
      return res;
    }
  }
};
