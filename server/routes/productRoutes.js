const { test, createProduct, getAProduct, updateProduct, deleteProduct, getProductByBranch } = require("../controllers/productController");

const router = require("express").Router();



router.get("/test", test);
router.post("/create", createProduct);
router.get("/getproductbybranch/:branchId", getProductByBranch);
router.get('/getproduct/:productId', getAProduct);
router.put('/updateproduct/:productId', updateProduct);
router.delete('/deleteproduct/:productId', deleteProduct);

module.exports = router;