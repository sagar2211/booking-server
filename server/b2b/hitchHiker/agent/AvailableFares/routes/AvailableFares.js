const router = require("express").Router();
const {
  searchFlights,
  ancillaries,
  ruleinformationtext,
  flightdetails,
  submitbooking,
  traveller_details,
  soapTest,
} = require("../controllers/AvailableFaresController");

// availablefares search API
router.post("/search", searchFlights);

// availablefares ancillaries API
router.post("/get/ancillaries", ancillaries);

// availablefares ruleinformationtext API
router.post("/get/ruleinformationtext", ruleinformationtext);

// availablefares flightdetails API
router.post("/get/flightdetails", flightdetails);

// availablefares submitbooking API
// router.post("/submitbooking", async (req, res) => {
//   try {
//     let result = await submitbooking(req);
//     if (result.error) {
//       res.status(MESSAGE.USER.DELETE.ERROR_USER_NOT_EXISTS.STATUS).json({
//         Result: result,
//       });
//     } else {
//       console.log("Hellooooo ",result);
//       res.status(MESSAGE.USER.ADD.SUCCESS.STATUS).json({
//         Result: result,
//       });
//     }
//   } catch (error) {
//     return MESSAGE.API.ERROR_INTERNAL_SERVER;
//   }
// });


router.post("/submitbooking", submitbooking);

router.post("/traveller_details", traveller_details);

module.exports = router;
