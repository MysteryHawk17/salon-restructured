const { test, createBill, getAllBills, getTotalSalesAmount, getAClientBill, deleteBill, getBranchwiseBills, getTotalSalesAmountByBranch, getParticularBill } = require("../controllers/billingController");

const router = require("express").Router();



router.get("/test", test);
router.post("/create", createBill);
router.get("/getallbills", getAllBills);
router.get("/gettotalsales", getTotalSalesAmount);
router.get("/gettotalsalesbranchwise/:branchId", getTotalSalesAmountByBranch);
router.get("/getclientbill/:clientNumber", getAClientBill);
router.delete("/deletebill/:billId", deleteBill);
router.get("/getbranchwisebill/:branchId", getBranchwiseBills)
router.get("/getparticularbill/:billId", getParticularBill)

module.exports = router;