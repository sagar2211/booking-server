const path = require('path');
const router = require("express").Router();
const { GetAirlinesByPrefix, GetFullAirlineName, GetAirportByIata, imagesLogo, imagesAirline, GetAirportsByPrefix, waitscreenImages } = require("../controllers/publicServiceController");


// Get Airlines By Prefix API
router.get("/GetAirlinesByPrefix/:city", GetAirlinesByPrefix);

// Get Full Airline Name API
router.get("/GetFullAirlineName/:airlineCode", GetFullAirlineName);

// Get Airport By Iata API
router.get("/GetAirportByIata/:iata",GetAirportByIata);

// Get Airports By Prefix API 
router.get("/GetAirportsByPrefix/:prefix", GetAirportsByPrefix);

// Get Images logo API
router.get("/images/logo/:id",imagesLogo);

// Get Images waitscreen API
router.get("/images/waitscreen/:id", waitscreenImages);

// Get images​ airline​
router.post("/images/airline/:code", imagesAirline);

module.exports = router;