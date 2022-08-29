const express = require("express");
const router = express.Router();
const { run, getList, createList, addMember, getMember, sendMail, transactionalTemplate, sendTemplate, submitBooking } = require("./mailChimpController");

router.get("/test",run);

router.get("/getList", async (req, res) => {
  let response = await getList();
  res.send(response);
});

router.post("/createList", createList);
router.post("/addMember", addMember);
router.get("/getMember", getMember);
router.post("/sendMail",sendMail);
router.post("/sendTemplate",sendTemplate);

router.post("/submitTicket", submitBooking);

router.get("/transactionalTemplate",transactionalTemplate);

module.exports = router;
