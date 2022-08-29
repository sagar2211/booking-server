const mailchimpClient = require("@mailchimp/mailchimp_transactional")("YhHTALDftOvKYxIM6wRA0A");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const path = require("path")
const fs = require('fs');
var ejs = require('ejs');
const _ = require("lodash");
var Handlebars = require('handlebars'), pdf = require('html-pdf');

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

exports.run = async (req, res) => {
  const response = await mailchimp.ping.get();
  res.send(response);
};

module.exports.getList = async () => {
  try {
    const response = await mailchimp.lists.getAllLists();
    return response;
  } catch (error) {
    return error;
  }
};

exports.createList = async (req, res) => {
  const {
    name,
    company,
    address,
    city,
    state,
    zip,
    country,
    from_name,
    from_email,
    subject,
    language,
  } = req.body;
  const footerContactInfo = {
    company,
    address1: address,
    city,
    state,
    zip,
    country,
  };
  const campaignDefaults = { from_name, from_email, subject, language };
  async function createAudience() {
    try {
      const audience = await mailchimp.lists.createList({
        name: name,
        contact: footerContactInfo,
        permission_reminder: "*|LIST:DESCRIPTION|*",
        email_type_option: true,
        campaign_defaults: campaignDefaults,
      });
      res.send(audience.id);
    } catch (err) {
      res.status(400).send(err);
    }
  }
  createAudience();
};

exports.addMember = async (req, res) => {
  let member = req.body;
  try {
    const list = await mailchimp.lists.getAllLists();
    let list_id = list.lists[0].id;
    const response = await mailchimp.lists.addListMember(list_id, {
      email_address: member.email,
      status: member.status,
      interests: {},
      merge_fields: {
        FNAME: member.firstName,
        LNAME: member.lastName,
      },
    });
    res.send(response);
  } catch (error) {
    res.send(error);
  }
};

exports.getMember = async (req, res) => {
  try {
    const list = await mailchimp.lists.getAllLists();
    let list_id = list.lists[0].id;
    const response = await mailchimp.lists.getListMembersInfo(list_id);
    res.send(response);
  } catch (error) {
    res.send(res);
  }
};

exports.sendMail = async (req, res) => {
  const msg = req.body;
  const message = {
    from_email: "no-reply@wadiia.com",
    subject: msg.subject,
    text: msg.text,
    to: [{
      email: msg.to_email,
      type: "to",
    }]
  };
  try {
    const response = await mailchimpClient.messages.send({
      message,
    });
    res.send(response);
  } catch (error) {
    res.send(error);
  }
};

exports.transactionalTemplate = async (req, res) => {
  try {
    const response = await mailchimpClient.templates.list();
    res.send(response);
  } catch (error) {
    res.send(error);
  }
};

exports.sendTemplate = async (mailDetails) => {
  let template = mailDetails.html.templateName
  let userName = mailDetails.html.userName
  let toEmail = mailDetails.to
  if (mailDetails.html.templateName !== "Welcome to Wadiia") {
    var password = mailDetails.html.password
  }
  try {
    const response = await mailchimpClient.messages.sendTemplate({
      message: {
        from_email: "no-reply@wadiia.com",
        subject: "msg.subject",
        to: [
          {
            email: toEmail,
            type: "to",
          },
        ],
        merge: true,
        global_merge_vars: [
          {
            name: "user_name",
            content: userName,
          },
          {
            name: "password",
            content: password,
          },
        ],
        merge_vars: [],
        async: false,
      },
      template_name: template,
      template_content: [{}],
      merge_language: "mailchimp",
    });
    return {
      type: "success",
      response: response
    }
  } catch (error) {
    return {
      type: "error",
      error: error
    }
  }
};

exports.submitBooking = async (req, res) => {
  let mailDetails = req;
  var extraServices = await extraService(mailDetails[0].extraService);
  var baggagePrice = await getbaggagePrice(mailDetails[0].bookingObj.result.bookings[0].bookingResponse.pnr.storedServices);

  // read ticket.ejs file
  let viewPath = path.join(__filename, "../../../server/view/ticket.ejs");
  // render ticket.ejs
  var pdfAttach = fs.readFileSync(viewPath, 'utf8');
  var htmlRenderized = ejs.render(pdfAttach, { filename: 'ticket.ejs', mailDetails: mailDetails, service: extraServices, baggage: baggagePrice });
  var flightDetails = mailDetails[0].bookingObj.result.bookings[0].bookingResponse.pnr.segments;
  var passengers = mailDetails[0].bookingObj.result.bookings[0].bookingResponse.pnr.passengers;
  var travelTime = mailDetails[0].flightdata.legs[mailDetails[0].flightdata.legs.length - 1].connections[0].connectionHeader.legTravelTime;
  var grandTotal = 0;


  


  // create dynamic PDF
  pdf.create(htmlRenderized).toStream(async function (err, stream) {
    if (err) {
      console.log("pdfError", err)
    } else {
      pdfPath = stream.path;
      await sendPdf(stream);
    }
  });

  // send PDF
  let sendPdf = async (stream) => {
    console.log("sendPdf",stream);
    try {
      grandTotal = (+extraServices.price) + (+baggagePrice.price) + (+mailDetails[0].bookingObj.result.bookings[0].bookingResponse.totalPrice.value) + (+mailDetails[0].bookingObj.result.bookings[0].bookingResponse.tax.value);
      var newPDF = fs.readFileSync(stream.path);
      const response = await mailchimpClient.messages.sendTemplate({
        message: {
          from_email: "no-reply@wadiia.com",
          subject: "msg.subject",
          to: [
            {
              email: "no-reply@wadiia.com",
              type: "to",
            },
          ],
          merge: true,
          global_merge_vars: [
            {
              name: "flightData",
              content: mailDetails,
            },
            {
              name: "flightDetails",
              content: flightDetails,
            },
            {
              name: "passengers",
              content: passengers,
            },
            {
              name: "travelTime",
              content: travelTime,
            },
            {
              name: "service",
              content: extraServices.price,
            },
            {
              name: "baggage",
              content: baggagePrice.price,
            },
            {
              name: "Total",
              content: grandTotal,
            }
          ],
          attachments: [{
            type: "application/pdf",
            name: "testing.pdf",
            content: newPDF.toString('base64')
          }],
          merge_vars: [],
          async: false,
        },
        template_name: "Booking Confirmation Email",
        template_content: [{}],
        merge_language: "mailchimp"
      });
      return ({
        type: "success",
        response: response
      })
    } catch (error) {
      return ({
        type: "error",
        error: error
      })
    }
  }
  
  return sendPdf;
};

var extraService = async (service) => {
  var finalPrice = 0;
  let services = service.hepstarServices;
  let wadiiaSupport = service.wadiiaSupport;
  if (services.length) {
    _.map(services, itr => {
      finalPrice = finalPrice + (+itr.price);
    })
    return {
      currency: services[0].currency,
      price: finalPrice + wadiiaSupport.price
    }
  } else {
    return {
      currency: wadiiaSupport.currency,
      price: finalPrice + wadiiaSupport.price
    }
  }
};

var getbaggagePrice = async (bagData) => {
  var finalPrice = 0;
  if (bagData.length) {
    _.map(bagData, itr => {
      finalPrice = finalPrice + (+itr.servicePrice.value);
    })
    return {
      currency: bagData[0].servicePrice.currencyCode,
      price: finalPrice
    }
  } else {
    return {
      currency: "ZAR",
      price: finalPrice
    }
  }
};