const { test, createService, getAllServicesByBranch, getAService, updateService, deleteService, createCategory, getAllCategory, getACategory, updateCategory, deleteCategory } = require("../controllers/servicesController");

const router = require("express").Router();



router.get("/test", test);
router.post("/createservice", createService);
router.get("/getallservices/:branchId", getAllServicesByBranch)
router.get("/getaservice/:serviceId", getAService);
router.put("/updateservice/:serviceId", updateService);
router.delete("/deleteservice/:serviceId", deleteService);
router.post("/category/create", createCategory);
router.get("/category/getallcategory", getAllCategory);
router.get('/category/getacategory/:id', getACategory);
router.put("/category/updatecategory/:id", updateCategory);
router.delete("/category/deletecategory/:id", deleteCategory);
module.exports = router;