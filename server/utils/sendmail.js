const nodemailer = require("nodemailer")
// require('dotenv').config();
const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
    var transporter = nodemailer.createTransport({
        host: process.env.TRANS_EMAIL,
        port: process.env.TRANS_PORT,
        secure: process.env.BOOL,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.KEY,
        },

    });
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message
    }
    var status=0;
    //checking if the the mail is sent properly or not
    const valuee=transporter.sendMail(options, (err, info) => {
        if (err) {
            console.log("Error")
            console.log(err)
            status=400;
            return ({ message: "Error", status: 400 })
        }
        else {
            console.log("Success")
            console.log(info)
            status=200;
            return ({ message: "Success", status: 200 })
        }
    })
    return(status);
    console.log("Here value")
    console.log(valuee)
}


module.exports = sendEmail