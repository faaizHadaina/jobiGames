const axios = require("axios");
require("dotenv").config();
const model = require("../models");
const Wallet = model.wallet;

function generateRandomReference(length = 20) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let reference = "";
  for (let i = 0; i < length; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
}

const giroService = {
  createVirtualAccount: async (accountName, email, phone, user_sn) => {
    const url = `${process.env.GIRO_URL}/virtual-accounts`;
    const apiKey = process.env.GIRO_KEY;

    // Check and modify the phone number
    if (phone.startsWith("0")) {
      phone = "234" + phone.slice(1);
    }

    const payload = {
      accountName: accountName,
      category: "secondary",
      currency: "NGN",
      emailAddress: email,
      mobile: {
        phoneNumber: phone,
        isoCode: "NG",
      },
    };

    const headers = {
      "x-giro-key": apiKey,
    };

    try {
      const response = await axios.post(url, payload, { headers });

      if (response.data.meta.statusCode === 201 && response.data.meta.success) {
        const walletData = {
          accountNumber: response.data.data.accountNumber,
          currency: response.data.data.currency,
          user: user_sn,
          accountName: response.data.data.accountName,
          balance: response.data.data.balance,
          bankCode: response.data.data.bankCode,
          bankName: response.data.data.bankName,
          publicId: response.data.data.publicId,
          status: "active",
          sn: user_sn,
        };

        const wallet = await Wallet.create(walletData);
        return response.data;
      } else {
        throw new Error("Failed to create the account.");
      }
    } catch (error) {
      console.error(`Attempt failed:`, error.message);
    }
  },

  fetchVirtualAccount: async (user_id) => {
    try {
      const userWallet = await Wallet.findOne({
        where: { publicId: user_id },
      });
      if (!userWallet) {
        throw new Error("Wallet Not Found");
      }

      const url = `${process.env.GIRO_URL}/virtual-accounts/${userWallet.publicId}`;
      const apiKey = process.env.GIRO_KEY;

      const headers = {
        "x-giro-key": apiKey,
      };

      const response = await axios.get(url, { headers });

      if (response.data.meta.statusCode === 200 && response.data.meta.success) {
        userWallet.balance = response.data.data.balance;
        await userWallet.save();
        return response.data.data;
      } else {
        throw new Error("Failed to fetch wallet status");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  fetchVirtualBalance: async (user_id) => {
    try {
      const userWallet = await Wallet.findOne({
        where: { publicId: user_id },
      });
      if (!userWallet) {
        throw new Error("Wallet Not Found");
      }

      const url = `${process.env.GIRO_URL}/virtual-accounts/${userWallet.publicId}/balance`;
      const apiKey = process.env.GIRO_KEY;

      const headers = {
        "x-giro-key": apiKey,
      };

      const response = await axios.get(url, { headers });

      if (response.data.meta.statusCode === 200 && response.data.meta.success) {
        userWallet.balance = response.data.data.availableAmount;
        await userWallet.save();
      } else {
        throw new Error("Failed to fetch virtual balance");
      }
    } catch (error) {
      console.error(`Attempt failed:`, error.message);
    }
  },

  transferFunds: async (user_id, amount) => {
    try {
      const userWallet = await Wallet.findOne({
        where: { publicId: user_id },
      });
      if (!userWallet) {
        throw new Error("Wallet Not Found");
      }

      const url = `${process.env.GIRO_URL}/virtual-accounts/transfer`;
      const apiKey = process.env.GIRO_KEY;

      const headers = {
        "x-giro-key": apiKey,
        "Content-Type": "application/json",
      };

      const reference = generateRandomReference();

      const payload = {
        destinationType: "VirtualAccount",
        destination: "vba-e41ea05c-2e62-4fa0-8b32-84894ee91dd3",
        sourceType: "VirtualAccount",
        source: userWallet.publicId,
        amount: amount,
        narration: "Gaming",
        currency: "NGN",
      };

      const response = await axios.post(url, payload, { headers });

      if (response.data.meta.statusCode === 200 && response.data.meta.success) {
        const verifyUrl = `${process.env.GIRO_URL}/transactions/${reference}/verify`;
        const verifyResponse = await axios.get(verifyUrl, { headers });

        if (
          verifyResponse.data.meta.statusCode === 200 &&
          verifyResponse.data.meta.success
        ) {
          await giroService.fetchVirtualBalance(user_id);
        } else {
          throw new Error("Failed to verify transfer");
        }
      } else {
        throw new Error("Failed to transfer funds");
      }
    } catch (error) {
      console.error(`Attempt failed:`, error.message);
    }
  },

  payWinner: async (user_id, amount) => {
    try {
      const userWallet = await Wallet.findOne({
        where: { publicId: user_id },
      });
      if (!userWallet) {
        throw new Error("Wallet Not Found");
      }

      const url = `${process.env.GIRO_URL}/virtual-accounts/transfer`;
      const apiKey = process.env.GIRO_KEY;

      const headers = {
        "x-giro-key": apiKey,
        "Content-Type": "application/json",
      };

      const reference = generateRandomReference();

      const payload = {
        destinationType: "VirtualAccount",
        destination: userWallet.publicId,
        sourceType: "VirtualAccount",
        source: "vba-e41ea05c-2e62-4fa0-8b32-84894ee91dd3",
        amount: amount,
        narration: "Winning",
        currency: "NGN",
      };

      const response = await axios.post(url, payload, { headers });

      return response;
    } catch (error) {
      console.error(`Attempt failed:`, error.message);
      throw new Error("Failed to transfer funds");
    }
  },
};

module.exports = giroService;
