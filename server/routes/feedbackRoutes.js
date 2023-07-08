const { test, createFeedback, getAllFeedbacks, getAFeedback } = require("../controllers/feedbackController");

const router = require("express").Router();


router.get("/test", test);
router.post("/create", createFeedback);
router.get("/getallfeedbacks", getAllFeedbacks);
router.get("/getfeedback/:feedbackId", getAFeedback);

module.exports = router;