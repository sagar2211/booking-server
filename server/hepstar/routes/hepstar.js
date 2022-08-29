const router = require("express").Router();
const { getProduct, getInsurance, purchaseProduct } = require("../controllers/hepstar");
const MESSAGE = require("../../../config/message.json");

// availablefares search API
router.post("/getProduct", getProduct);

router.post("/purchaseProduct", purchaseProduct);
// router.post("/getProduct", getInsurance);

module.exports = router;
