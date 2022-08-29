const { getGenrateToken } = require("../b2b/hitchHiker/token");
const {sendmail} = require("../utils/email");
const { cronPwdEmail } = require("../utils/email")
let cron = require("node-cron");

// scheduler for get  and refresh Token
module.exports.tokenScedular =()=>{
    return cron.schedule("0 0 */1 * * *", async()=>{
        getGenrateToken();
    })
};

// scheduler for send email
  cron.schedule("*/10 * * * * *", async()=>{
    cronPwdEmail();
  })
