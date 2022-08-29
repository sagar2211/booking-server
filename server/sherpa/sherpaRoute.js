const router = require("express").Router();
const {createTrip} = require("./sherpaController");

router.get('/sherpa', createTrip);

module.exports = router;