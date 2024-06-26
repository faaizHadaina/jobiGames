const crypto = require('crypto');
const { wallet: Wallet } = require('../models');

const handleWebhook = async (req, res) => {
    const secret = process.env.GIRO_KEY;
    const payload = JSON.stringify(req.body);
    const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
    
    if (hash === req.headers['x-giro-signature']) {
        const event = req.body;

        try {
            switch (event.event) {
                case 'giro.account.credit':
                    await updateUserWallet(event.data);
                    break;
                default:
                    console.log('Unhandled event:', event.event);
            }

            res.status(200).send();
        } catch (error) {
            console.error('Error handling webhook event:', error.message);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(401).send('Unauthorized');
    }
};

const updateUserWallet = async (data) => {
    try {
        const publicId = data.destination;
        const accountNumber = data.destinationData.accountNumber;  
        const amount = data.amount;

        const wallet = await Wallet.findOne({
            where: {
                publicId: publicId,
                accountNumber: accountNumber
            }
        });

        if (wallet && data.status === 'success') {
            wallet.balance += amount;
            await wallet.save();
            console.log(`Wallet updated successfully: ${amount}`);
        } else {
            console.log('Wallet not found for account_number:', accountNumber);
        }
    } catch (error) {
        console.error('Error updating wallet balance:', error.message);
    }
};

module.exports = { handleWebhook };