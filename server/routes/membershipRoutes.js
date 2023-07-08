const { test, createMembership, getAllMembership, getAMembership, updateMembershipDetails, deleteMembership, addService, deleteService } = require("../controllers/membershipController");

const router = require("express").Router();


router.get("/test", test);
router.post("/create", createMembership);
router.get("/getallmembership", getAllMembership);
router.get("/getamembership/:id", getAMembership);
router.put("/updatemembership/:id", updateMembershipDetails);
router.delete("/deletemembership", deleteMembership);
router.put("/addservice/:id", addService)
router.put("/deleteservice/:id", deleteService);

module.exports = router;