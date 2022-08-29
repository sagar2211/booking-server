const nodemailer = require("nodemailer");
const config = require("../../config/authConfig");
const { emailModel } = require("../model/email_details");
var request = require("request");
const winstonLogger = require("../libs/winstonLib");
const MESSAGE = require("../../config/message.json");
let transport;

module.exports.sendmail = (email, seoMessage) => {
    console.log(email, seoMessage);
  transport = nodemailer.createTransport({
    host: config.mailConfig.host, //"202.90.192.16",
    port: config.mailConfig.port,
    secure: false,
    requireTLS: true,
    auth: {
      user: config.mailConfig.user,
      pass: config.mailConfig.password,
    },
    tls: {
      // do not fail on invalid certs
      // rejectUnauthorized: false,
    },
  });

  const message = {
    from: config.mailConfig.user, // Sender address
    to: email, // List of recipients
    subject: config.mailConfig.subject, // Subject line
    text: seoMessage, // Plain text body
  };

  emailModel.create({
      from_email: config.mailConfig.user,
      to_email: email,
      subject: config.mailConfig.subject,
      cc: "",
      bcc: "",
      message_content: seoMessage,
      ip_address: config.mailConfig.host,
      api_key: "",
      create_date: new Date(),
      last_update_date: new Date(),
      reply_to_email: "",
      requested_on: new Date(),
      sent_on: new Date(),
      status: 0,
    })
    .then((result) => {
        console.log("email send successfully",result);
      return {
        status: 200,
        message: "email send successfully",
      };
    })
    .catch((error) => {
        console.log(error);
      return {
        status: 200,
        message: error,
      };
    });
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
      // this.sendmail(element.firs)
      transport = nodemailer.createTransport({
        host: config.mailConfig.host, //"202.90.192.16",
        port: config.mailConfig.port,
        secure: false,
        requireTLS: true,
        auth: {
          user: config.mailConfig.user,
          pass: config.mailConfig.password,
        },
        tls: {},
      });

        transport.sendMail(mailOption, async (error, info) => {
          if (error) {
            winstonLogger.error(err);
          } else {
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
        });
      
    });
  } catch (error) {}
};
