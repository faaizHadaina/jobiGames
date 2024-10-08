const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const model = require("../models");
const Users = model.users;
const Wallet = model.wallet;
const createTransactions = require("../utils/functions/recordTransaction");
const { forgotPasswordSender } = require("../mailers/sender");
const { sendVerificationEmail } = require("../mailers/utils/verificationEmail");
const { sendOnboardingEmail } = require("../mailers/utils/onboardingEmail");
const giroService = require("../service/giro.service");

function generateID(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const authCtrl = {
  register: async (req, res, next) => {
    try {
      const { fullname, email, password, nick, sex, dob, phone } = req.body;

      let checkEmail = await Users.findOne({ where: { email: email } });
      if (checkEmail) {
        return res
          .status(400)
          .json({ message: "This user already exists. Kindly Login" });
      }

      // Base64 encode the password
      const base64Password = Buffer.from(password).toString("base64");

      const code = crypto.randomInt(100000, 1000000);
      const createdUser = await Users.create({
        ID: generateID(20),
        fullname,
        email,
        password: base64Password,
        verificationCode: code,
        nick,
        sex,
        dob,
        phone,
        realmoney: false,
        dateadded: new Date().toString(),
      });

      const { password: _, ...userResponse } = createdUser.get({ plain: true });
      const verificationResponse = await sendVerificationEmail(
        createdUser.email
      );
      if (!verificationResponse.success) {
        return res
          .status(verificationResponse.status)
          .json({ message: verificationResponse.message, success: false });
      }

      const onboardingResponse = await sendOnboardingEmail(createdUser.email);
      if (!onboardingResponse.success) {
        return res
          .status(onboardingResponse.status)
          .json({ message: onboardingResponse.message, success: false });
      }
      const giroUser = await giroService.createVirtualAccount(
        fullname,
        email,
        phone,
        createdUser.sn
      );
      createdUser.ID = giroUser.data.publicId;
      createdUser.save();
      return res.status(201).json({
        user: userResponse,
        message: "Account successfully created",
        success: true,
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        message: err.message,
        success: false,
      });
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          message: "Failed login attempt",
          email: "Incorrect credentials",
          success: false,
        });
      }
      const base64Password = Buffer.from(password).toString("base64");

      if (base64Password === user.password) {
        let token = jwt.sign(
          {
            user_id: user.sn,
            email: user.email,
            name: user.fullname,
          },
          process.env.SECRET,
          {
            expiresIn: "2h",
          }
        );

        let profile = {
          sn: user.sn,
          email: user.email,
          name: user.fullname,
          balance: user.balance,
          nick: user.nick,
          isEmailVerified: user.isEmailVerified,
        };

        let result = {
          user: profile,
          token: token,
        };

        const wallet = await Wallet.findOne({ where: { publicId: user.ID } });

        if (!wallet) {
          try {
            await giroService.createVirtualAccount(
              user.fullname,
              user.email,
              user.phone,
              user.ID,
              user.sn
            );
            console.log("Virtual account created successfully");
          } catch (error) {
            console.error("Error creating virtual account:", error.message);
          }
        } else {
          profile.balance = wallet.balance;
          user.balance = wallet.balance;
          user.save();
          console.log("Wallet already exists for user:", user.sn);
        }
        const transResp = await giroService.transferFunds(wallet.publicId, 500);

        return res.status(200).json({
          ...result,
          transResp,
          message: "Login success new",
          success: true,
        });
      } else {
        return res.status(403).json({
          message: "Failed login attempt",
          email: "Incorrect password or email",
          success: false,
        });
      }
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        message: err,
        success: false,
      });
    }
  },

  verify: async (req, res) => {
    try {
      const { code } = req.query;

      const user = await Users.findOne({ where: { verificationCode: code } });
      if (!user) {
        return res.status(404).json({
          message: "Invalid code",
          success: false,
        });
      } else if (user.isEmailVerified) {
        return res.status(400).json({
          message: "Email already verified",
          success: false,
        });
      }
      await Users.update({ isEmailVerified: true }, { where: { sn: user.sn } });

      return res.status(200).json({
        message: "Email verification success",
        success: true,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        success: false,
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          message: "Invalid email",
          success: false,
        });
      }

      const code = crypto.randomInt(100000, 1000000);
      const passwordResetCode = await bcrypt.hash(code.toString(), 10);
      await Users.update(
        { passwordResetCode: passwordResetCode },
        { where: { sn: req.params.id } }
      );
      forgotPasswordSender(user.email, user.name, code);
      return res.status(200).json({
        message: "Verification code sent to your email",
        success: true,
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        message: err.message,
        success: false,
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      const { resetCode } = req.query;
      const user = await Users.findOne({ where: { email: email } });
      if (!user) {
        return res.status(404).json({
          message: "Invalid email",
          success: false,
        });
      }
      let isMatch = await bcrypt.compare(
        resetCode.toString(),
        user.passwordResetCode
      );
      if (isMatch) {
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        await user.update(
          { password: hashPassword },
          { passwordResetCode: "" }
        );
        return res.status(201).json({
          message: "Your password has been successfully reset",
          success: true,
        });
      } else {
        return res.status(404).json({
          message: "Invalid code",
          success: false,
        });
      }
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        message: err.message,
        success: false,
      });
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await Users.findOne({ where: { sn: req.user.sn } });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Authentication failed", success: false });
      }

      const decodedStoredPassword = Buffer.from(
        user.password,
        "base64"
      ).toString("utf-8");
      let isMatch = oldPassword === decodedStoredPassword;

      if (isMatch) {
        const base64Password = Buffer.from(newPassword).toString("base64");
        await user.update({ password: base64Password });
        return res.status(200).json({
          message: "Your password has been successfully reset",
          success: true,
        });
      } else {
        return res.status(401).json({
          message: "Invalid old password",
          success: false,
        });
      }
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        message: "Server error: " + err.message,
        success: false,
      });
    }
  },
  fundWallet: async (req, res, next) => {
    try {
      const { amount } = req.body;
      const user = await Users.findOne({ where: { sn: req.user.sn } });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Authentication failed", success: false });
      }

      const amountToAdd = parseFloat(amount);
      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid amount", success: false });
      }

      const currentBalance = parseFloat(user.balance);
      const newBalance = currentBalance + amountToAdd;

      await user.update({ balance: newBalance });

      const data = {
        amount: amountToAdd,
        product: "Real Money",
        type: "Credit",
      };

      await createTransactions([user], data);

      return res.status(200).json({
        message: "Wallet successfully funded",
        success: true,
        newBalance: newBalance,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        message: "Server error: " + error.message,
        success: false,
      });
    }
  },
  refreshToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "No token provided or invalid token format",
          success: false,
        });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET, {
        ignoreExpiration: true,
      });
      const user = await Users.findOne({ where: { sn: decoded.user_id } });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      let newToken = jwt.sign(
        {
          user_id: user.sn,
          email: user.email,
          name: user.fullname,
        },
        process.env.SECRET,
        { expiresIn: "2h" }
      );

      let profile = {
        sn: user.sn,
        email: user.email,
        name: user.fullname,
        balance: user.balance,
        nick: user.nick,
        isEmailVerified: user.isEmailVerified,
      };

      let result = {
        user: profile,
        token: newToken,
      };

      return res.status(200).json({
        ...result,
        message: "Token refreshed successfully",
        success: true,
      });
    } catch (err) {
      console.error(err.message);
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token, please login again",
          success: false,
        });
      } else {
        return res.status(500).json({
          message: "An error occurred while refreshing the token",
          success: false,
        });
      }
    }
  },
  deleteAccount: async (req, res, next) => {
    try {
      const result = await Users.destroy({ where: { sn: req.user.sn } });
      if (result) {
        res
          .status(200)
          .json({ success: true, message: "User deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  destroyAccount: async (req, res, next) => {
    try {
      const { email, password } = req.query;

      // Find the user by email
      const user = await Users.findOne({ where: { email } });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const masterPassword = "247365";
      let isMatch = password === masterPassword;

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect password" });
      }

      // Delete the user if the password is correct
      const result = await Users.destroy({ where: { email } });

      if (result) {
        res
          .status(200)
          .json({ success: true, message: "User deleted successfully" });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Failed to delete user" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = authCtrl;
