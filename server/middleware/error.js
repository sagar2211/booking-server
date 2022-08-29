const winston = require('../libs/winstonLib');
const MESSAGE = require('../../config/message.json');
module.exports = function(error,req,res,next){
    winston.error(error.message);
    res=MESSAGE.API.ERROR_INTERNAL_SERVER;
}