const fetch = require("node-fetch");
const winstonLogger = require("../../../../libs/winstonLib");
const MESSAGE = require("../../../../../config/message.json");
const { seoRequest } = require("../../../../model/seoRequest");
const { getLatestToken } = require("../../token");
const { sendmail } = require("../../../../utils/seoMail");
const moment = require("moment");
const _ = require("lodash");
const fs = require("fs");

var finalObj = {
  calendar_json: {},
};

var calendar_json = {};
module.exports.searchFlights = async (req) => {
  const reqBody = req.body;
  const clientIp = req.header('x-forwarded-for') || req.connection.remoteAddress;
  let finalOutput = storeRequestData(reqBody, clientIp).then((seoResult) => {
    seoRequest.findByIdAndUpdate(
      seoResult._id,
      {
        $set: {
          // response: finalOutput,
          end_time: new Date(),
        },
      },
      { new: true }, function (err, doc) {
        if (err)
          winstonLogger.info(err);
        else
          winstonLogger.info(doc);
      }
    )

    if (reqBody.apiKey !== process.env.API_KEY) {
      sendmail(process.env.USER_EMAIL, MESSAGE.JWT.ERROR_UNAUTHORIZED_USER.MESSAGE);
      return MESSAGE.JWT.ERROR_UNAUTHORIZED_USER;
    }

    let fromDate = reqBody.fromDate;
    let toDate = reqBody.toDate;

    let startDate = new Date(
      fromDate.year + "-" + fromDate.month + "-" + (+fromDate.day + 1)
    );

    let endDate = new Date(
      toDate.year + "-" + toDate.month + "-" + (+toDate.day + 1)
    );

    let dateArray = [];
    for (var m = moment(startDate); m.isBefore(endDate); m.add(1, "days")) {
      dateArray.push(m.format("YYYY-MM-DD"));
    }

    if (dateArray.length) {
      let Result = temp(0, dateArray, reqBody)
        .then((finalOutput) => {
          winstonLogger.info("inside output");
          seoRequest.findByIdAndUpdate(
            { _id: seoResult._id },
            {
              $set: {
                response: finalOutput,
                status: "success",
                end_time: new Date(),
              },
            },
            { new: true }, function (err, res) {
              if (err)
                winstonLogger.info(err);
              else
                winstonLogger.info(res);
            }
          )
          winstonLogger.info("seoResult._id");
          // winstonLogger.info("finalOutput",finalOutput)
          return finalOutput;
        })
        .catch((failureCallback) => {
          winstonLogger.error("err", failureCallback);
          sendmail(process.env.USER_EMAIL, failureCallback);
          return failureCallback;
        });
      return Result;
    }
  });
  return finalOutput;
};

const storeRequestData = async (reqBody, clientIp) => {
  let seoObject = new seoRequest({
    from: reqBody.segments[0].from,
    to: reqBody.segments[0].to,
    fromDate: reqBody.fromDate,
    toDate: reqBody.toDate,
    apiKey: reqBody.apiKey,
    ipAddress: clientIp,
  });
  try {
    let result = await seoObject.save();
    return result;
  } catch (error) {
    winstonLogger.error(error);
    sendmail(process.env.USER_EMAIL, error);
    return error;
  }
};

const temp = async (index, dateArray, reqBody) => {
  let element = dateArray[index];
  let day = moment(new Date(element)).date();
  let month = moment(new Date(element)).month() + 1;
  let year = moment(new Date(element)).format("YYYY");
  segments = reqBody.segments;
  reqBody.segments[0].departureDate.day = day;
  reqBody.segments[0].departureDate.month = month;
  reqBody.segments[0].departureDate.year = +year;
  delete reqBody.fromDate;
  delete reqBody.toDate;
  delete reqBody.tripType;
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 1 && day <= 9) {
    day = "0" + day;
  }
  let dates = year + month + day;
  if (!_.includes(finalObj.calendar_json, dates)) {
    calendar_json[dates] = [];
  }
  await searchFlights(reqBody, dates, finalObj)
    .then(async (data) => {
      if (index === dateArray.length - 1) {
        finalObj["calendar_json"] = data;
        // finalObj["calendar_json"][dates] = data;
        let newArray = JSON.stringify(finalObj);
        fs.writeFile("newfile.json", newArray, "utf8", function (err) {
          if (err) throw err;
        });
      }
      if (index < dateArray.length) {
        index++;
        if (dateArray[index]) {
          await temp(index, dateArray, reqBody);
        }
      }
    })
    .catch((failureCallback) => {
      return failureCallback;
    });
  return finalObj;
};

const searchFlights = async (req, dateObj, finalObj) => {
  let hitchHikerToken = getLatestToken();
  try {
    let response = await fetch(
      `https://test.api.agentplus.io/availablefares/search`,
      {
        method: "post",
        headers: {
          "content-type": "application/json",
          Authorization: hitchHikerToken,
        },
        body: JSON.stringify(req),
      }
    );
    var data = await response.json();
    if (data.responseMetaData.errorOccured == true) {
      sendmail(process.env.USER_EMAIL, data.responseMetaData.errorReason.errorMessage);
      return data.responseMetaData.errorReason.errorMessage;
    }
    let fare = data.result.fareSearchResult.fares;
    let Obj = {
      afd: [],
    };
    _.map(fare, (itr, indx) => {
      Obj = {};
      Obj.pr = itr.totalPrice;
      Obj.al = itr.legs[0].connections[0].segments[0].carrier.allianceCode;
      Obj.alc = itr.legs[0].connections[0].segments[0].carrier.code;
      Obj.aln = itr.legs[0].connections[0].segments[0].flightNumber;
      Obj.dt = itr.legs[0].connections[0].connectionHeader.departureDisplayTime;
      Obj.dd = itr.legs[0].connections[0].connectionHeader.departureDate;
      Obj.ad = itr.legs[0].connections[0].connectionHeader.arrivalDate;
      Obj.at = itr.legs[0].connections[0].connectionHeader.arrivalDisplayTime;
      Obj.via = itr.legs[0].connections[0].connectionHeader.viaToolTipContent;
      Obj.dur = `${itr.legs[0].connections[0].connectionHeader.legTravelTime.addHours}h ${itr.legs[0].connections[0].connectionHeader.legTravelTime.minutes}m`;
      Obj.AirC = item.legs[0].platingCarrier.code;
      let segment = itr.legs[0].connections[0].segments;
      const flightNumber = segment.map((segment) => segment.flightNumber);
      Obj.afd = flightNumber;
      calendar_json[dateObj].push(Obj);
      return calendar_json;
    });
    return calendar_json;
  } catch (err) {
    sendmail(process.env.USER_EMAIL, err);
    return err;
  }
};

getDate = (date) => {
  let day = moment(new Date(date)).date();
  let month = moment(new Date(date)).month() + 1;
  let year = moment(new Date(date)).format("YYYY");
  if (month >= 1 || month <= 9) {
    month = +("0" + month);
  }
  if (day >= 1 || day <= 9) {
    day = +("0" + day);
  }
  let dates = year + month + day;
  return dates;
};
