const winstonLogger = require("../../libs/winstonLib");
const _ = require("lodash");
const fetch = require("node-fetch");
const { isEmpty } = require("lodash");

exports.createContact = async (req, res) => {
  let user = req;
  let reqBody =
  {
    "name": user.prefix + " " + user.firstName + " " + user.lastName,
    "email": user.email,
    "phone": user.mobile.dialCode + user.mobile.number,
    "mobile": user.mobile.dialCode + user.mobile.number,
    "address": "",
    "custom_fields": {lifecycle_stage: "Customer", source: "wadiia Customer"},
    "description": "New User(" + user.firstName + ") created."
  }

  try {
    let response = await fetch(
      `${process.env.FRESHDESK_URL}/api/v2/contacts`,
      {
        method: "post",
        headers: {
          'Content-Type': 'application/json',
          authorization: `Basic ${process.env.FRESHDESK_API_KEY}`,
          accept: 'application/json'
        },
        body: JSON.stringify(reqBody),
      }
    );
    let data = await response.json();
    let obj = {}
    if(!isEmpty(data.errors) || (data.code === 'invalid_credentials')){
      obj ={
        status : false,
        data : data
      }
    } else {
      obj = {
        status: true,
        data: data
      }
    }
    return obj;
  } catch (err) {
    winstonLogger.error(err)
    let obj = {
      status: false,
      data: err
    }
    return obj
  }
}

exports.searchContact = async (req, res) => {
  let user = req;

  try {
    let response = await fetch(
      `${process.env.FRESHDESK_URL}/api/v2/contacts/autocomplete?term=${user.email}`,
      {
        method: "get",
        headers: {
          'Content-Type': 'application/json',
          authorization: `Basic ${process.env.FRESHDESK_API_KEY}`,
          accept: 'application/json'
        }
      }
    );
    let data = await response.json();
    let obj = {}
    if (!isEmpty(data.errors)) {
      obj = {
        status: false,
        data: data
      }
    } else {
      obj = {
        status: true,
        data: data
      }
    }
    return obj;
  } catch (err) {
    winstonLogger.error(err)
    let obj = {
      status: false,
      data: err
    }
    return obj
  }
}

exports.generateTicket = async (req, res) => {
  let user = req.mainTravellerInfo;
  let reqBody =
  {
    "name": user.prefix + " " + user.firstName + " " + user.lastName,
    "email": user.email,
    "phone": user.phone.dialCode + user.phone.number,
    "type": "Problem",
    "subject": "Ticket Generate",
    "description": generateDescription(req),
    "status": 2,
    "priority": 1,
    "source": 2
  }

  try {
    let response = await fetch(
      `${process.env.FRESHDESK_URL}/api/v2/tickets`,
      {
        method: "post",
        headers: {
          'Content-Type': 'application/json',
          authorization: `Basic ${process.env.FRESHDESK_API_KEY}`,
          accept: 'application/json'
        },
        body: JSON.stringify(reqBody),
      }
    );
    let data = await response.json();
    let obj = {}
    if (!isEmpty(data.errors)) {
      obj = {
        status: false,
        data: data
      }
    } else {
      obj = {
        status: true,
        data: data
      }
    }
    return obj;
  } catch (err) {
    winstonLogger.error(err)
    let obj = {
      status: false,
      data: err
    }
    return obj
  }
}

let generateDescription = (req) => {
  let description = "\n\nUser Name : " + req.mainTravellerInfo.firstName + " " + req.mainTravellerInfo.lastName + "\nPhone: " + req.mainTravellerInfo.phone.dialCode + req.mainTravellerInfo.phone.number + "\nEmail:" + req.mainTravellerInfo.email + "\n\nSource: " + req.flightData.legs[0].connections[0].segments[0].departureAirport.cityName + "[" + req.flightData.legs[0].connections[0].segments[0].departureAirport.cityCode + "]" + ", \nDesignation: " + req.flightData.legs[0].connections[0].segments[0].arrivalAirport.cityName + "[" + req.flightData.legs[0].connections[0].segments[0].arrivalAirport.cityCode + "]" + "\n\nBooking Date: " + Date.now() + "\n\nTicket Purchase Date: " + Date.now() + "\n\nTransaction ID (If available) : ICICITX9928393\n\nAmount : " + req.flightData.currency + " " + (req.flightData.totalPrice + req.flightData.totalTax) + "/-"
  return description;
}

exports.updateContact = async (req, res) => {
  let user = req;
  let reqBody =
  {
    "description": "User (" + user.firstName + ") updated.",
    "custom_fields": {lifecycle_stage: "Customer", source: "wadiia Customer"},
  }

  try {
    let response = await fetch(
      `${process.env.FRESHDESK_URL}/api/v2/contacts/${user.id}`,
      {
        method: "put",
        headers: {
          'Content-Type': 'application/json',
          authorization: `Basic ${process.env.FRESHDESK_API_KEY}`,
          accept: 'application/json'
        },
        body: JSON.stringify(reqBody),
      }
    );
    let data = await response.json();
    let obj = {}
    if (!isEmpty(data.errors)) {
      obj = {
        status: false,
        data: data
      }
    } else {
      obj = {
        status: true,
        data: data
      }
    }
    return obj;
  } catch (err) {
    winstonLogger.error(err)
    let obj = {
      status: false,
      data: err
    }
    return obj
  }
}