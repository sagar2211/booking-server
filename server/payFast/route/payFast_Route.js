const router = require("express").Router();
const {pingPayFast, payRequest, payNow} = require('../controller/payFast_Controller');

router.post('/paymentProcess', payNow);

router.get('/ping', pingPayFast);

router.get('/pay', payRequest);

module.exports = router;