console.log("📍 EMAIL UTILS LOADED FROM:", __filename);
console.log("📧 ENV EMAIL_USER:", process.env.EMAIL_USER);
console.log("🔐 ENV EMAIL_PASS:", process.env.EMAIL_PASS);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error("📬 MAILER VERIFY ERROR:", err);
  } else {
    console.log("📬 Mailer is ready to send messages");
  }
});

exports.sendOTP = async (to, otp, subject) => {
  console.log(`📩 Sending OTP ${otp} to ${to}`);
  try {
    const info = await transporter.sendMail({
      from: `"Blogify" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: `Your OTP is: ${otp}`
    });
    console.log("✉ Email sent:", info.response);
    return info;
  } catch (err) {
    console.error("❌ FAILED TO SEND EMAIL:", err);
    throw err;
  }
};
