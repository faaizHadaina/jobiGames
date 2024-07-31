const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { users: Users } = require("../../models");
const { welcomeSender } = require("../sender");

const sendVerificationEmail = async (email) => {
  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return { success: false, message: "Invalid email", status: 404 };
    }

    const code = crypto.randomInt(1000, 10000);
    
    await Users.update({ verificationCode: code }, { where: { sn: user.sn } });
    welcomeSender(user.email, user.fullName, code);

    return { success: true, message: "Verification code sent to your email", status: 200 };
  } catch (err) {
    console.log(err.message);
    return { success: false, message: err.message, status: 500 };
  }
};

module.exports = { sendVerificationEmail };
