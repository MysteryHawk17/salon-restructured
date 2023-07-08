const { test, createClient, getAllClients, getClient, getClientByNumber, updateClient, deleteClient, buyMembership, checkMembership, updateMembership } = require("../controllers/clientController");

const  router= require("express").Router();




router.get("/test",test);
router.post("/create",createClient);
router.get("/getallclient",getAllClients);
router.get("/getclient/:id",getClient);
router.get("/getclientbynumber/:clientNumber",getClientByNumber)
router.put("/updateclient/:id",updateClient);
router.delete("/deleteclient/:id",deleteClient);
router.post("/buymembership/:id",buyMembership);
router.get("/checkmembership/:clientNumber",checkMembership)
router.put("/updatemembership/:clientNumber",updateMembership);


module.exports=router;

