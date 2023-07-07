const { test, createBranch, branchLogin, updateBranch, getAllBranch, getAllChildrenBranch, getSingleBranch, deleteBranch, buySubscription, pendingBranches, updateBranchStatus } = require("../controllers/branchController");

const router=require("express").Router();


router.get("/test",test);
router.post('/createbranch',createBranch);
router.post("/loginbranch",branchLogin);
router.get("/getallbranches",getAllBranch);
router.get("/getchildenbranch/:parentId",getAllChildrenBranch)
router.get("/getsinglebranch/:branchId",getSingleBranch);
router.put("/updatebranch/:branchId",updateBranch)
router.delete("/deletebranch/:branchId",deleteBranch)
router.post("/buysubscription",buySubscription)
router.get("/getallpendingbranch",pendingBranches);
router.post("/updatestatus/:branchId",updateBranchStatus)

module.exports=router;
