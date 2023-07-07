const { test, createService, getAllServicesByBranch, getAService, updateService, deleteService } = require("../controllers/servicesController");

const router = require("express").Router();



router.get("/test", test);
router.post("/createservice", createService);
router.get("/getallservices/:branchId", getAllServicesByBranch)
router.get("/getaservice/:serviceId", getAService);
router.put("/updateservice/:serviceId", updateService);
router.delete("/deleteservice/:serviceId", deleteService);

module.exports = router;