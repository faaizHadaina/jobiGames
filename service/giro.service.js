const axios = require('axios');
require('dotenv').config();
const model = require("../models");
const Wallet = model.wallet;

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; 

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRandomReference(length = 20) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let reference = '';
    for (let i = 0; i < length; i++) {
        reference += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return reference;
}

const giroService = {
    createVirtualAccount: async (accountName, email, phone, user_id) => {
        const url = `${process.env.GIRO_URL}/virtual-accounts`;
        const apiKey = process.env.GIRO_KEY;

        // Check and modify the phone number
        if (phone.startsWith('0')) {
            phone = '234' + phone.slice(1);
        }

        const payload = {
            accountName: accountName,
            category: "secondary",
            currency: "NGN",
            emailAddress: email,
            mobile: {
                phoneNumber: phone,
                isoCode: "NG"
            }
        };

        const headers = {
            'x-giro-key': apiKey
        };

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await axios.post(url, payload, { headers });

                if (response.data.meta.statusCode === 201 && response.data.meta.success) {
                    const walletData = {
                        accountNumber: response.data.data.accountNumber,
                        currency: response.data.data.currency,
                        user: user_id,
                        accountName: response.data.data.accountName,
                        balance: response.data.data.balance,
                        bankCode: response.data.data.bankCode,
                        bankName: response.data.data.bankName,
                        publicId: response.data.data.publicId,
                        status: 'active',
                        sn: user_id
                    };

                    const wallet = await Wallet.create(walletData);
                    return wallet;
                } else {
                    throw new Error('Failed to create the account.');
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);
                if (attempt === MAX_RETRIES) {
                    throw new Error('Exceeded maximum retry attempts');
                }
                await delay(RETRY_DELAY);
            }
        }
    },

    fetchVirtualAccount: async (user_id) => {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const userWallet = await Wallet.findOne({ where: { sn: user_id } });
                if (!userWallet) {
                    throw new Error("Wallet Not Found");
                }

                const url = `${process.env.GIRO_URL}/virtual-accounts/${userWallet.publicId}`;
                const apiKey = process.env.GIRO_KEY;

                const headers = {
                    'x-giro-key': apiKey
                };

                const response = await axios.get(url, { headers });

                if (response.data.meta.statusCode === 200 && response.data.meta.success) {
                    userWallet.status = response.data.data.status;
                    await userWallet.save();
                } else {
                    throw new Error("Failed to fetch wallet status");
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);
                if (attempt === MAX_RETRIES) {
                    throw new Error('Exceeded maximum retry attempts');
                }
                await delay(RETRY_DELAY);
            }
        }
    },

    fetchVirtualBalance: async (user_id) => {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const userWallet = await Wallet.findOne({ where: { sn: user_id } });
                if (!userWallet) {
                    throw new Error("Wallet Not Found");
                }

                const url = `${process.env.GIRO_URL}/virtual-accounts/${userWallet.publicId}/balance`;
                const apiKey = process.env.GIRO_KEY;

                const headers = {
                    'x-giro-key': apiKey
                };

                const response = await axios.get(url, { headers });

                if (response.data.meta.statusCode === 200 && response.data.meta.success) {
                    userWallet.balance = response.data.data.availableAmount;
                    await userWallet.save();
                } else {
                    throw new Error("Failed to fetch virtual balance");
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);
                if (attempt === MAX_RETRIES) {
                    throw new Error('Exceeded maximum retry attempts');
                }
                await delay(RETRY_DELAY);
            }
        }
    },

    transferFunds: async (user_id, amount) => {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const userWallet = await Wallet.findOne({ where: { sn: user_id } });
                if (!userWallet) {
                    throw new Error("Wallet Not Found");
                }

                const url = `${process.env.GIRO_URL}/virtual-accounts/transfer`;
                const apiKey = process.env.GIRO_KEY;

                const headers = {
                    'x-giro-key': apiKey,
                    'Content-Type': 'application/json'
                };

                const reference = generateRandomReference();

                const payload = {
                    destinationType: "VirtualAccount",
                    destination: "vba-c6b3e044-b24c-4a4e-bac4-f43f96a44c7b",
                    sourceType: "VirtualAccount",
                    source: userWallet.publicId,
                    amount: amount,
                    narration: "Gaming",
                    currency: "NGN"
                };

                const response = await axios.post(url, payload, { headers });

                if (response.data.meta.statusCode === 200 && response.data.meta.success) {
                    const verifyUrl = `${process.env.GIRO_URL}/transactions/${reference}/verify`;
                    const verifyResponse = await axios.get(verifyUrl, { headers });

                    if (verifyResponse.data.meta.statusCode === 200 && verifyResponse.data.meta.success) {
                        await giroService.fetchVirtualBalance(user_id);
                    } else {
                        throw new Error("Failed to verify transfer");
                    }
                } else {
                    throw new Error("Failed to transfer funds");
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);
                if (attempt === MAX_RETRIES) {
                    throw new Error('Exceeded maximum retry attempts');
                }
                await delay(RETRY_DELAY);
            }
        }
    },
};

module.exports = giroService;
