const request = require("request");
const winstonLogger = require("../../libs/winstonLib");
var hitchHikerToken = '';

module.exports.getGenrateToken = () => {
  request.get(
    {
      uri: `${process.env.HITCH_HIKER_URL}/Account/Login/${process.env.REACT_APP_HITCHHIKER_APIKEY}`,
      headers: {
        "content-type": "application/json",
      },
    },
    function (err, res, body) {
      if (err) {
        winstonLogger.error(err);
      } else {
        let resp = JSON.parse(body);
        hitchHikerToken = `Bearer ${resp.token}`;
        winstonLogger.info("genrating new token");
        winstonLogger.info(hitchHikerToken);
      }
    });
};

module.exports.getLatestToken = () => {
  return hitchHikerToken;
};