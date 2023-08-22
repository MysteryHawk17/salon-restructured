const { test, createAppointment, updateAppointment, updateAppointmentStatus, getAllAppointment, getParticularAppointment, getBranchwiseAppointment, getStaffwiseAppointment, userAppointments, userAppointmentsDatewise } = require("../controllers/appointmentController");

const router = require("express").Router();


router.get("/test", test);
router.post("/createappointment", createAppointment); 
router.put("/updateappointment/:appointmentId", updateAppointment);
router.put("/updateappointmentstatus/:appointmentId", updateAppointmentStatus)
router.get("/getallappointments", getAllAppointment);
router.get("/getparticularappointment/:appointmentId", getParticularAppointment)
router.get("/getbranchwise/:branchId", getBranchwiseAppointment)
router.get("/getstaffwise/:staffId", getStaffwiseAppointment);
router.get('/getuserappointment/:clientNumber', userAppointments);
router.get('/getuserappointmentdatewise', userAppointmentsDatewise);


module.exports = router;