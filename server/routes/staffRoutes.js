const { test, createStaff, getAStaff, updateStaff, updateProfilePic, updateIdProof, deleteStaff, getStaffsByBranch } = require("../controllers/staffController");

const router = require("express").Router();
const upload = require("../utils/multer")


router.get("/test", test);
router.post('/create', upload.array("images"), createStaff);
router.get('/getastaff/:staffId', getAStaff)
router.get("/getallstaffbybranch/:branchId", getStaffsByBranch);
router.put("/editdetails/:staffId", updateStaff)
router.patch("/editprofilepic/:staffId", upload.array("images"), updateProfilePic)
router.patch('/editidproof/:staffId', upload.array("images"), updateIdProof);
router.delete('/deletestaff/:staffId', deleteStaff);



module.exports = router;