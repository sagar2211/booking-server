const _ = require("lodash");
const config = require("../../config/authConfig");
const { emailModel } = require("../model/email_details");
var request = require("request");
const winstonLogger = require("../libs/winstonLib");
const MESSAGE = require("../../config/message.json");
const { sendTemplate } = require("../mailChimp/mailChimpController");

module.exports.sendmail = async (user_name, user_email, password, user_id, templateName) => {
  let toEmail = user_email;
  var res;
  const message = {
    from: process.env.USER_EMAIL, //config.mailConfig.user, // Sender address
    to: user_email, // List of recipients
    subject: config.mailConfig.subject, // Subject line
    content: {
      userId: user_id,
      userName: user_name,
      password: password,
      templateName: templateName,
    }, // Plain text body
  };

  try {
    await emailModel.create({
      from_email: process.env.USER_EMAIL, //config.mailConfig.user,
      to_email: toEmail,
      subject: config.mailConfig.subject,
      cc: "",
      bcc: "",
      message_content: message.content,
      ip_address: config.mailConfig.host,
      api_key: process.env.MAILCHIMP_ID,
      create_date: new Date(),
      last_update_date: new Date(),
      reply_to_email: "",
      requested_on: new Date(),
      sent_on: new Date(),
      status: 0,
      user_id: user_id,
    })
    .then((result) => {
      res = {
        status: 200,
        type:"success",
        message: "email send successfully",
        data:result
      };
    })
    .catch((error) => {
      res = {
        status: 200,
        type:"error",
        message: error,
      };
    });
    if(res.type == "error"){
      return res
    }else{
      return res
    }
  } catch (error) {
    return error
  }
};
 
module.exports.cronPwdEmail = async () => {
  let emailData = await emailModel.find({ status: 0 });
  try {
    let data = emailData;
    data.forEach((element) => {
      let mailOption = {
        from: element.from_email, // Sender address
        to: element.to_email, // List of recipients
        subject: element.subject, // Subject line
        html: element.message_content, // Plain text body
      };
      sendTemplate(mailOption).then((result)=>{
        if(result.type =="error"){
          return result.error
        }else{
          try {
            request.patch(
              {
                url: `${process.env.BASE_PATH}/user/emailupdate/${element.id}`,
              },
              function (err, response) {
                if (err) {
                  winstonLogger.error(err);
                }
              }
            );
          } catch (error) {
            winstonLogger.error(err);
            return MESSAGE.API.ERROR_INTERNAL_SERVER;
          }
        }
      })
    });
  } catch (error) {
    console.log(error);
  }
};