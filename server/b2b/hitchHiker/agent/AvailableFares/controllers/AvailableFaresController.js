const MESSAGE = require("../../../../../../config/message.json");
const isEmpty = require("../../../../../libs/checkLib");
const { getLatestToken } = require("../../../token");
const { travellerDetails } = require('../../../../../model/traveller_details');
const { submitBookingInfo } = require('../../../../../model/submit_booking');
const { bookedTicket } = require('../../../../../model/bookedTicket');
const { searchRequest } = require('../../../../../model/search-request');
const { purchaseProduct } = require('../../../../../hepstar/controllers/hepstar');
const { submitBooking } = require('../../../../../mailChimp/mailChimpController');
const { generateTicket } = require('../../../../../sugar-crm/controllers/sugarcrm');
const { User } = require('../../../../../model/userModel');
const _ = require("lodash");
const axios = require('axios');
const winstonLogger = require("../../../../../libs/winstonLib");
const fetch = require("node-fetch");
const { isObject } = require("lodash");
const { add_Ons } = require("../../../../../model/Add-Ons");

exports.searchFlights = async (req, res) => {
  let hitchHikerToken = getLatestToken();
  try {
    axios.post(`${process.env.HITCH_HIKER_URL}/availablefares/search`, JSON.stringify(req.body),
      {
        headers: {
          "content-type": "application/json",
          Authorization: hitchHikerToken,
        },
      }).then(response => {
        const searchReq = new searchRequest({
          reqObj: generateReqObj(req.body)
        });
        searchReq.save();
        res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
          Result: response.data,
        });
      });
  } catch (err) {
    winstonLogger.error(err)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: err,
    });
  }
}

generateReqObj = (req) => {
  let reqObj = {};
  reqObj = {
    depart_city: req.segments[0].from,
    arrival_city: req.segments[0].to,
    depart_date: req.segments[0].departureDate,
    arrival_date: req.segments[0].arrivalDate ? req.segments[0].arrivalDate : null,
    passengers: req.passengers,
    userIp: req.ipAddress,
    userLocation: req.location ? req.location : null,
    searchTime: new Date().toISOString()
  }
  return reqObj;
}

exports.ancillaries = async (req, res) => {
  let hitchHikerToken = getLatestToken();
  try {
    axios.post(`${process.env.HITCH_HIKER_URL}/availablefares/get/ancillaries`, JSON.stringify(req.body),
      {
        headers: {
          "content-type": "application/json",
          Authorization: hitchHikerToken,
        }
      }).then(response => {
        res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
          Result: response.data,
        });
      });
  } catch (err) {
    winstonLogger.error(err)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: err,
    });
  }
}

exports.ruleinformationtext = async (req, res) => {
  let hitchHikerToken = getLatestToken();
  try {
    axios.post(`${process.env.HITCH_HIKER_URL}/availablefares/get/ruleinformationtext`, JSON.stringify(req.body),
      {
        headers: {
          "content-type": "application/json",
          Authorization: hitchHikerToken,
        }
      }).then(response => {
        winstonLogger.info(response.data)
        res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
          Result: response.data,
        });
      });
  } catch (err) {
    winstonLogger.error(err)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: err,
    });
  }
}

module.exports.flightdetails = async (req, res) => {
  let hitchHikerToken = getLatestToken();
  try {
    axios.post(`${process.env.HITCH_HIKER_URL}/availablefares/get/flightdetails`, JSON.stringify(req.body),
      {
        headers: {
          "content-type": "application/json",
          Authorization: hitchHikerToken,
        }
      }).then(response => {
        winstonLogger.info(response.data)
        res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
          Result: response.data,
        });
      });
  } catch (err) {
    winstonLogger.error(err)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: err,
    });
  }
}

module.exports.submitbooking = async (req, res) => {
  let info = req.body.finalObj;
  var flightData = req.body.flightObj;
  var hepstarData = req.body.hepstarServices;
  var extraServices = req.body.extraServices.wadiiaSupport;
  var extraService = req.body.extraServices;
  var mainTravellerInfo = req.body.hepstarServices.travellerInfo.adultArray[0];
  info.mainTravellerInfo = mainTravellerInfo;
  info.flightData = flightData;
  let gustUser = '';
  try {
    let booking_info = new submitBookingInfo({
      bookingObj: info
    })
    // console.log("info === ",info);
    // if (info.id == null) {
      let user = hepstarData.travellerInfo.adultArray[0];
      let oldUser = await User.find({ email: user.email });
      console.log("oldUser === ",oldUser);
      if (!isEmpty(oldUser)) {
        if (info.id == null) {
          info.id = oldUser.id;
        }
      } else {
        let newUser = new User({
          prefix: user.prefix,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          countryCode: user.countryCode,
          mobile: user.phone.number,
          email: user.email,
          password: "W0123",
          taxNo: user.taxNo,
          registrationId: user.registrationId,
          userType: "Gust-User",
          documentType: user.documentType,
          documentId: user.documentId,
          passportIssuingCountry: user.country,
        });
        gustUser = await newUser.save();
        if(info.id == null){
          info.id = gustUser.id;
        }
      }
    // }
    await booking_info.save();
    bookingHH(info).then(async (finalRes) => {
      // save extraservices data
      await services(extraServices, info.id);
      console.log("finalRes === ",finalRes);
      if (finalRes.status === false) {
        let ticketRes = generateTicket(info);
        res.send({
          status: 503,
          error: finalRes.responseMetaData,
          ticketResponse : ticketRes
        })
      } else {
        var hepStarResult = await purchaseProduct(hepstarData);
        if (hepStarResult.status == 'success') {
          console.log("finalRes.data.result.result",finalRes);
          if (finalRes.data.result.result?.bookings[0].bookingResponse !== null && finalRes.data.result.result.bookings[0].bookingResponse !== undefined) {
            let booked_ticket_info = new bookedTicket({
              hepStarResult: hepStarResult,
              flightdata: flightData,
              bookingObj: finalRes.data.result,
              extraService: extraService,
              user_id: info.id
            })
            // save bookedticket Data
            var response = await booked_ticket_info.save();
            var ticketHistoryArray = [];
            if (response.user_id != undefined) {
              await User.findByIdAndUpdate(info.id, {
                $push: { "bookedTicketArray": response._id }
              })
            }
            ticketHistoryArray.push(response);
            // send pdf
            await submitBooking(ticketHistoryArray);
            res.send({
              status: 200,
              response: ticketHistoryArray
            });
          } else {
            let booked_ticket_info = new bookedTicket({
              hepStarResult: hepStarResult,
              flightdata: flightData,
              bookingObj: finalRes.data.result,
              extraService: extraService,
              user_id: info.id
            })
            var response = await booked_ticket_info.save();
            console.log("response", info);
            let ticketRes = generateTicket(info);
            res.send({
              status: 400,
              error: response,
              ticketResponse : ticketRes
            })
          }
        } else {
          let error = JSON.parse(hepStarResult.result)
          console.log("error",error);
          res.send({
            status: 503,
            error: error
          })
        }
      }
    });
  } catch (err) {
    generateTicket(info)
    console.log(err);
    return err;
  }
}

let services = async (service, id) => {
  let newService = new add_Ons({
    name: service.name,
    price: service.price,
    currency: service.currency,
    value: service.value,
    user_id: id
  })
  try {
    let saveService = await newService.save();
    return saveService;
  } catch (error) {
    return error
  }
}

let bookingHH = async (info) => {
  let hitchHikerToken = getLatestToken();
  try {
    let response = await fetch(
      `https://test.api.agentplus.io/availablefares/submitbooking`,
      {
        method: "post",
        headers: {
          "content-type": "application/json",
          Authorization: hitchHikerToken,
        },
        body: JSON.stringify(info),
      }
    );

    // winstonLogger.info(response.json());
    let data = await response.json();
    let obj ={
      status : true,
      data : data
    }
    return obj;
  } catch (err) {
    winstonLogger.error(err)
    let obj ={
      status : false,
      data : err
    }
    return obj
  }
}

exports.traveller_details = async function (req, res) {
  let traveller = req.body;
  let newTraveller = new travellerDetails({
    firstname: traveller.firstname,
    middlename: traveller.middlename,
    lastname: traveller.lastname,
    gender: traveller.gender,
    dob: traveller.dob,
    passport_no: traveller.passport_no,
    passport_issue_country: traveller.passport_issue_country,
    passport_expiry: traveller.passport_expiry,
    frequentFlyerAirline: traveller.frequentFlyerAirline,
    countryCode: traveller.countryCode,
    email: traveller.email,
    mobile: traveller.mobile,
    interest: traveller.interest,
    gstno: traveller.gstno
  })
  try {
    let result = await newTraveller.save();
    winstonLogger.info(result);
    res.send({
      TYPE: MESSAGE.TRAVELLER.ADD.SUCCESS.TYPE,
      STATUS: MESSAGE.TRAVELLER.ADD.SUCCESS.STATUS,
      MESSAGE: MESSAGE.TRAVELLER.ADD.SUCCESS.MESSAGE,
      data: result
    });
  } catch (error) {
    winstonLogger.error(error);
    res.send({
      TYPE: MESSAGE.API.ERROR_INTERNAL_SERVER.TYPE,
      STATUS: MESSAGE.API.ERROR_INTERNAL_SERVER.STATUS,
      MESSAGE: MESSAGE.API.ERROR_INTERNAL_SERVER.MESSAGE + ' ' + error
    })
  }
}

exports.soapTest = async (req, res) => {
  soap.createClient(url, function (err, client) {
    client.MyFunction(args, function (err, result) {

    });
  });
}