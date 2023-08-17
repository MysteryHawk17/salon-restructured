const { test, createOwner, loginOwner, getAllOwners, getAowner, updateOwner, deleteOwner, findParentBranch } = require("../controllers/salonOwnerController");

const router = require("express").Router();



router.get("/test", test);
router.post("/createowner", createOwner)
router.post("/loginowner", loginOwner)
router.get("/getallowner", getAllOwners);
router.get("/getaowner/:id", getAowner);
router.put("/updateowner/:id", updateOwner);
router.delete("/deleteowner/:id", deleteOwner);
router.get("/getparentbranch/:ownerId", findParentBranch);

module.exports = router;