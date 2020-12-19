const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // 1] create a transporter
    const transporter = nodemailer.createTransport({
      // 1] config with normal gmail
      // service: "Gmail",
      // auth: {
      //   user: process.env.EMAIL_USERNAME,
      //   pass: process.env.EMAIL_PASSWORD,
      // },

      // activate in gmail 'less sercure app' option

      // 2] use mailtrap.io
      host: process.env.MAIL_TRAP_HOST,
      port: process.env.MAIL_TRAP_PORT,
      auth: {
        user: process.env.MAIL_TRAP_USER,
        pass: process.env.MAIL_TRAP_PASS,
      },
    });
    // 2] define the email options
    const mailOptions = {
      from: "Kent bui abc@abc.com",
      to: options.email,
      subject: options.subject,
      text: options.message,
      // html:
    };

    // 3] actually send email with the nodemailer
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
