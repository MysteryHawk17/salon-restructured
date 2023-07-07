const { test, createSuperAdmin, loginSuperAdmin, deleteSuperAdmin } = require("../controllers/superAdminController");

const router = require("express").Router();



router.get("/test", test);
router.post("/register", createSuperAdmin);
router.post("/login", loginSuperAdmin);
router.delete("/deleteadmin/:id", deleteSuperAdmin);


module.exports = router;