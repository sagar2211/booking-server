const router = require("express").Router();
const { createContact, generateTicket, updateContact, searchContact} = require("../controllers/sugarcrm");


// router.get("/generateToken", generateToken);

router.post("/generateTicket", generateTicket);

router.post("/createContact", createContact);

router.put("/updateContact", updateContact);

router.get("/searchContact", searchContact);

module.exports = router;
