const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

// new Email(user, url).sendWellcome();
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Kent Bui <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === "production") {
      // sendgrid
      console.log(1);
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: "apikey",
          pass:
            "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",
        },
      });
    }

    return nodemailer.createTransport({
      //] use mailtrap.io
      host: process.env.MAIL_TRAP_HOST,
      port: process.env.MAIL_TRAP_PORT,
      auth: {
        user: process.env.MAIL_TRAP_USER,
        pass: process.env.MAIL_TRAP_PASS,
      },
    });
  }

  // send the actual email
  async send(template, subject) {
    //1] render html on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // console.log(html);

    //2] define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.fromString(html),
    };

    //3] create a transport and send email

    await this.newTransport().sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
        return process.exit(1);
      }

      console.log("Send token successful");
      console.log(nodemailer.getTestMessageUrl(info));

      this.newTransport().close();
    });
  }

  async sendWellcome() {
    this.send("wellcome", "Wellcome to the Natours Family!");
  }

  async sendResetPassword() {
    this.send(
      "resetPassword",
      "Your password reset token , (valid only 10 minutes)"
    );
  }
};
