const axios = require('axios');
require('dotenv').config();
const model = require("../models");
const Wallet = model.wallet;

function generateRandomReference(length = 20) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let reference = '';
    for (let i = 0; i < length; i++) {
        reference += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return reference;
}


const giroService = {
    createVirtualAccount: async (accountName, user_id) => {
        const url = `${process.env.GIRO_URL}/virtual-accounts`;
        const apiKey = process.env.GIRO_KEY;
        const payload = {
            accountName: accountName
        };

        const headers = {
            'x-api-key': apiKey
        };

        try {
            await axios.post(url, payload, { headers });

            let foundAccount = null;
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const searchUrl = `${process.env.GIRO_URL}/virtual-accounts?page=${currentPage}`;
                const searchResponse = await axios.get(searchUrl, { headers });

                if (searchResponse.data.meta.statusCode === 200 && searchResponse.data.meta.success) {
                    const accounts = searchResponse.data.data;

                    for (const account of accounts) {
                        if (account.accountName === accountName) {
                            foundAccount = account;
                            break;
                        }
                    }

                    hasMorePages = searchResponse.data.meta.pagination.totalCount > currentPage * searchResponse.data.meta.pagination.perPage;
                    currentPage++;
                } else {
                    throw new Error('Failed to search for the account.');
                }

                if (foundAccount) {
                    break;
                }
            }

            if (foundAccount) {
                const walletData = {
                    accountNumber: foundAccount.accountNumber,
                    currency: foundAccount.currency,
                    user: foundAccount.user,
                    accountName: foundAccount.accountName,
                    balance: foundAccount.amount,  
                    bankCode: foundAccount.bankCode,
                    bankName: foundAccount.bankName,
                    publicId: foundAccount.publicId,
                    status: foundAccount.status,
                    id: foundAccount.id,
                    sn: user_id  
                };

                await Wallet.create(walletData);
                return foundAccount;
            } else {
                throw new Error('Account not found.');
            }
        } catch (error) {
            console.error('Error in virtual account process:', error.message);
            throw new Error(error.message);
        }
    },
    fetchVirtualAccount: async (user_id) => {
        try {
            const userWallet = await Wallet.findOne({ where: { sn: user_id } });
            if (!userWallet) {
                throw new Error("Wallet Not Found");
            }

            const url = `${process.env.GIRO_URL}/virtual-accounts/${userWallet.id}`;
            const apiKey = process.env.GIRO_KEY;

            const headers = {
                'x-api-key': apiKey
            };

            const response = await axios.get(url, { headers });

            if (response.data.meta.statusCode === 200 && response.data.meta.success) {
                userWallet.status = response.data.data.status;
                await userWallet.save(); 
            } else {
                throw new Error("Failed to Fetch wallet status");
            }
        } catch (error) {
            console.error('Error fetching virtual account:', error.message);
            throw new Error(error.message);
        }
    },
    fetchVirtualBalance: async (user_id) => {
        try {
            const userWallet = await Wallet.findOne({ where: { sn: user_id } });
            if (!userWallet) {
                throw new Error("Wallet Not Found");
            }

            const url = `${process.env.GIRO_URL}/virtual-accounts/${userWallet.id}/balance`;
            const apiKey = process.env.GIRO_KEY;

            const headers = {
                'x-api-key': apiKey
            };

            const response = await axios.get(url, { headers });

            if (response.data.meta.statusCode === 200 && response.data.meta.success) {
                userWallet.balance = response.data.data.availableAmount;
                await userWallet.save(); 
            } else {
                throw new Error("Failed to fetch virtual balance");
            }
        } catch (error) {
            console.error('Error fetching virtual balance:', error.message);
            throw new Error(error.message);
        }
    },
    transferFunds: async (user_id, accountNumber, amount, bankCode, narration) => {
        try {
            const userWallet = await Wallet.findOne({ where: { sn: user_id } });
            if (!userWallet) {
                throw new Error("Wallet Not Found");
            }

            const url = `${process.env.GIRO_URL}/virtual-accounts/transfer`;
            const apiKey = process.env.GIRO_KEY;

            const headers = {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            };

            const reference = generateRandomReference();

            const payload = {
                accountNumber: accountNumber,
                bankCode: bankCode,
                sourceAccount: userWallet.accountNumber,
                amount: amount,
                narration: narration,
                reference: reference
            };

            const response = await axios.post(url, payload, { headers });

            if (response.data.meta.statusCode === 200 && response.data.meta.success) {
                const verifyUrl = `${process.env.GIRO_URL}/transactions/${reference}/verify`;
                const verifyResponse = await axios.get(verifyUrl, { headers });

                if (verifyResponse.data.meta.statusCode === 200 && verifyResponse.data.meta.success) {
                    await giroService.fetchVirtualBalance(user_id)
                } else {
                    throw new Error("Failed to verify transfer");
                }
            } else {
                throw new Error("Failed to transfer funds");
            }
        } catch (error) {
            console.error('Error transferring funds:', error.message);
            throw new Error(error.message);
        }
    }
};

module.exports = giroService;
