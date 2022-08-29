const MESSAGE = require("../../../config/message.json");
const crypto = require("crypto");
const payfast = require('@payfast/core');
const fetch = require("node-fetch");
const axios = require('axios');
const winstonLogger = require("../../libs/winstonLib");
// _payNow API

exports.payNow = async (req, res) => {
    console.log(req.body);
    try {
        axios.post(`https://sandbox.payfast.co.za/eng/process`, JSON.stringify(req.body),
            {
                headers:{
                    "content-type": "application/json",
                },
            }).then(response => {
                winstonLogger.info(response.data);
                res.send(response.data);
            });
    } catch (err) {
        winstonLogger.error(err);
        res.send(err);
    }
}

// ping payFast
exports.pingPayFast = async (reqs, res) => {
    var req = {
        version: "v1",
        timestamp: "2022-07-04T00:00:00+02:00",
        passphrase: "",
        merchant_id: "10000100"
    }

    let data = {
        merchant_id: "10000100",
        merchant_key: "46f0cd694581a",
        return_url: "https://yourApplication/paymentscreen",
        cancel_url: "https://yourApplication/paymentscreen",
        notify_url: "https://yourApplication/paymentscreen",
        name_first: "",
        email: "suraj.narule@embarkingonvoyage.com",
        m_payment_id: "unique_id_for_user",
        amount: 1000,
        item_name: "payment_name",
        item_description: "description_if_any",
        custom_int1: "custome_integer_value_if_any",
        custom_str1: "custome_string_value_if_any",
        custom_str2: "custome_string_value_if_any"
    };

    try {
        let token = await generateAPISignature(data, "");
        const response = await payfast.ping({
            "version": req.version,
            "timestamp": req.timestamp,
            "passphrase": req.passphrase,
            "merchant-id": req.merchant_id
        });
        const responses = await payfast.validate.sender('www.payfast.co.za');
        console.log(response, responses, token);
        res.send(response);
    } catch (error) {
        res.send(error)
    }
}

exports.payRequest = async (req, res) => {
    let data = {
        "token": "xxx",
        "name_last": "",
        "item_name": "xxx",
        "signature": "xxx",
        "amount_fee": "0.00",
        "amount_net": "0.00",
        "name_first": "",
        "custom_str1": "",
        "custom_str2": "",
        "custom_str3": "",
        "custom_str4": "",
        "custom_str5": "",
        "custom_int1": "",
        "custom_int2": "",
        "custom_int3": "",
        "custom_int4": "",
        "custom_int5": "",
        "merchant_id": "10000100",
        "m_payment_id": "xxx",
        "billing_date": "2020-01-01",
        "amount_gross": "0.00",
        "pf_payment_id": "xxx",
        "email_address": "suraj.narule@embarkingonvoyage.com",
        "payment_status": "COMPLETE",
        "item_description": ""
    }
    try {
        const response = await payfast.validate.request(data);
        console.log(response);
        res.send(response);
    } catch (error) {
        res.send(error)
    }
}

exports.TransactionHistory = async (req, res) => {
    try {
        const response = await payfast.transactions.daily({
            "date": "2020-05-20",
            "version": "v1",
            "timestamp": "2020-01-01T00:00:00",
            "passphrase": "xxx",
            "merchant-id": "xxx"
        });
        console.log(response);
        res.send(response);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

// Signature generation
const generateAPISignature = async (data, passPhrase = null) => {
    // Arrange the array by key alphabetically for API calls
    let ordered_data = {};
    Object.keys(data).sort().forEach(key => {
        ordered_data[key] = data[key];
    });
    data = ordered_data;

    // Create the get string
    let getString = '';
    for (let key in data) {
        getString += key + '=' + encodeURIComponent(data[key]).replace(/%20/g, '+') + '&';
    }

    // Remove the last '&'
    getString = getString.substring(0, getString.length - 1);
    if (passPhrase !== null) { getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`; }

    // Hash the data and create the signature
    return crypto.createHash("md5").update(getString).digest("hex");
}