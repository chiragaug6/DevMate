const nodemailer = require("nodemailer");

const sendEmail = async function (toEmail, subject, message) {
  try {
    const transporter = new nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FromEmail,
      to: toEmail,
      subject: subject,
      html: message,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
