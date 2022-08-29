const request = require("request");
const winstonLogger = require("../../../../../libs/winstonLib");
const MESSAGE = require("../../../../../../config/message.json");

module.exports.flightApiSeting = async (city) => {
  try{
    let response = await fetch(`${process.env.HITCH_HIKER_PUBLIC_URL}/api/admin/flightapi/get`,
    {
    method: 'get',
    headers: {
      "content-type": "application/json"
    },
    })
    return response.json();
    }catch(err){
    return err;
  }
}