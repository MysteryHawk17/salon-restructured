const { test, createSubscription, getAllSubscription, deleteSubscription, getAsubscription } = require("../controllers/subscriptionController");

const router = require("express").Router();



router.get("/test", test);
router.post("/create", createSubscription);
router.get("/getallsubscription", getAllSubscription);
router.get("/getasubscription/:id",getAsubscription)
router.delete("/deletesubscription/:id", deleteSubscription);


module.exports = router;