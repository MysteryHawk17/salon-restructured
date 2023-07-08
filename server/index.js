const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const connectDB = require('./db/connect');
require('dotenv').config();
const bodyParser = require("body-parser");

//routes imports
const superAdminRoutes = require("./routes/superAdminRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const salonOwnerRoutes = require("./routes/salonOwnerRoutes");
const branchRoutes = require("./routes/branchRoutes");
const serviceRoutes = require("./routes/servicesRoutes");
const productRoutes = require("./routes/productRoutes");
const staffRoutes = require("./routes/staffRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const clientRoutes = require("./routes/clientRoutes");
const appointmentRoutes=require("./routes/appointmentRoutes");
const feedbackRoutes=require("./routes/feedbackRoutes")
const billingRoutes=require("./routes/billingRoutes");
//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(cors());

//route middlewares
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/owner", salonOwnerRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/product", productRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/appointment",appointmentRoutes);
app.use("/api/feedback",feedbackRoutes)
app.use("/api/billing",billingRoutes);
//server test route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Saloon server is running" })

})
//connection to database
connectDB(process.env.MONGO_URI);

//server listenng 
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

