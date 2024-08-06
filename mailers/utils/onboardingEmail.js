const { users: Users } = require("../../models");
const { onboardingSender } = require("../sender");

const sendOnboardingEmail = async (email) => {
  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return { success: false, message: "Invalid email", status: 404 };
    }

    onboardingSender(user.email, user.fullname);

    return { success: true, message: "Onboarding mail sent to your email", status: 200 };
  } catch (err) {
    console.log(err.message);
    return { success: false, message: err.message, status: 500 };
  }
};

module.exports = { sendOnboardingEmail };
