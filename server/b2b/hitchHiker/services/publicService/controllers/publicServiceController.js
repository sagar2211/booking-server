const winstonLogger = require("../../../../../libs/winstonLib");
const MESSAGE = require("../../../../../../config/message.json");
const axios = require('axios');


exports.GetAirlinesByPrefix = (req, res) => {
  console.log(req.params.city);
  let city = req.params.city
  axios.get(`${process.env.HITCH_HIKER_PUBLIC_URL}/publicservices/GetAirportsByPrefix/${city}`).then(response => {
    let data = response.data;
    winstonLogger.info(data);
    res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
      Result: data
    });
  }).catch(error => {
    winstonLogger.error(error)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: error
    });
  });
};

exports.GetFullAirlineName = (req, res) => {
  let airlineCode = req.params.airlineCode;
  axios.get(`${process.env.HITCH_HIKER_PUBLIC_URL}/publicservices/GetFullAirlineName/${airlineCode}`).then(response => {
    let data = response.data;
    winstonLogger.info(data)
    res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
      ststus: MESSAGE.USER.ADD.SUCCESS.STATUS,
      Result: data
    });
    res.send(data);
  }).catch(error => {
    winstonLogger.error(error)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: error
    });
  });
}

exports.GetAirportByIata = (req, res) => {
  let iata = req.params.iata;
  axios.get(`${process.env.HITCH_HIKER_PUBLIC_URL}/publicservices/GetAirportByIata/${iata}`).then(response => {
    let data = response.data;
    winstonLogger.info(data)
    res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
      Result: data
    });
  }).catch(error => {
    winstonLogger.error(error)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: error
    });
  });
}

exports.GetAirportsByPrefix = (req, res) => {
  let prefix = req.params.prefix;
  axios.get(`${process.env.HITCH_HIKER_PUBLIC_URL}/publicservices/GetAirportsByPrefix/${prefix}`).then(response => {
    let data = response.data;
    winstonLogger.info(data);
    res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
      Result: data
    });
  }).catch(error => {
    winstonLogger.error(error);
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: error
    });
  });
}

exports.imagesLogo = (req, res) => {
  let id = req.params.id;
  axios.get(`${process.env.HITCH_HIKER_PUBLIC_URL}/publicservices/images/logo/${id}`).then(response => {
    let data = response.data;
    winstonLogger.info(data);
    res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
      Result: data
    });
  }).catch(error => {
    winstonLogger.error(error);
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: error
    });
  });
}

//@todo for feature
exports.waitscreenImages = (req, res) => {
  let id = req.params.id;
  axios.get(`${process.env.HITCH_HIKER_PUBLIC_URL}/publicservices/images/waitscreen/${id}`).then(response => {
    let data = response.data;
    winstonLogger.info(data);
    res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
      Result: data
    });
  }).catch(error => {
    winstonLogger.error(error)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: error
    });
  });
}

//@todo for feature
exports.imagesAirline = (req, res) => {
  console.log(req.params.code);
  let code = req.params.code;
  axios.get(`${process.env.HITCH_HIKER_PUBLIC_URL}/publicservices/images/airline/${code}`).then(response => {
    let data = response.data;
    winstonLogger.info(data)
    res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
      Result: data
    });
  }).catch(error => {
    winstonLogger.error(error)
    res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
      Result: error
    });
  });
}