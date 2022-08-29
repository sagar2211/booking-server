const winstonLogger = require("../../../../../libs/winstonLib");
const MESSAGE = require("../../../../../../config/message.json");
const { getLatestToken } = require("../../../token");
const { bookingDetails } = require('../../../../../model/ticket-booking');
const _ = require("lodash");

exports.booking_details = async function (req, res) {
    let info = req.body;
    let bookingInfo = new bookingDetails({
        bookingIndentifier: { cartId: info.bookingIndentifier.cartId, bookingId: info.bookingIndentifier.bookingId }
    });
    _.map(info.services, srvc => {
        let obj = {}
        obj.carrier = srvc.carrier;
        obj.code = srvc.code;
        obj.date = srvc.date;
        obj.location = srvc.location;
        obj.passengerSelection = srvc.passengerSelection;
        obj.quantity = srvc.quantity;
        obj.text = srvc.text;
        obj.serviceType = srvc.serviceType;
        obj.extensions = srvc.extensions;
        obj.id = srvc.id;
        bookingInfo.services.push(obj);
    })

    _.map(info.remarks, itr => {
        let obj = {}
        obj.passengerSelection = itr.passengerSelection;
        obj.remark = itr.remark;
        obj.remarkType = itr.remarkType;
        obj.segmentSelection = itr.segmentSelection;
        obj.typeCode = itr.typeCode;
        bookingInfo.remarks.push(obj);
    })

    _.map(info.ssrServices, itr => {
        let obj = {}
        obj.carrierCode = itr.carrierCode;
        obj.code = itr.code;
        obj.freeText = itr.freeText;
        obj.passengerSelection = itr.passengerSelection;
        obj.segments = itr.segments;
        bookingInfo.ssrServices.push(obj);
    })

    _.map(info.osi, itr => {
        let obj = {}
        obj.carrierCode = itr.carrierCode;
        obj.freeText = itr.freeText;
        obj.passengerSelection = itr.passengerSelection;
        bookingInfo.osi.push(obj);
    })

    _.map(info.passengerAPIS, itr => {
        let obj = {}
        obj.passengerNumber = itr.passengerNumber;
        obj.apis = itr.apis;
        obj.firstName = itr.firstName;
        obj.lastName = itr.lastName;
        obj.middleName = itr.middleName;
        obj.title = itr.title;
        obj.gender = itr.gender;
        obj.dateOfBirth = itr.dateOfBirth;
        bookingInfo.passengerAPIS.push(obj);
    })

    try {
        console.log(bookingInfo);
        let result = await bookingInfo.save();

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