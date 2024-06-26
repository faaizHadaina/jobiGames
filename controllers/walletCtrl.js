const { wallet: Wallet } = require('../models');

const walletCtrl = {
    getWallet: async (req, res) => {
        try {
            const wallet = await Wallet.findOne({ where: { sn: req.user.sn }});
            if (!wallet) {
                return res.status(404).json({
                    message: "Wallet Not Found",
                    success: false,
                });
            }
            return res.status(200).json({
                data: wallet,
                message: "Wallet Retrieved successfully",
                success: true
            });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({
                message: err.message,
                success: false,
            });
        }
    }
};

module.exports = walletCtrl;
