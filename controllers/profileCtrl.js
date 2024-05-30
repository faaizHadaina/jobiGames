const model = require('../models');
const Users = model.users;

const profileCtrl = {
    updateOne: async (req, res) => {
        try {
            await Users.update({ where: {sn: req.params.id}});
            return res.status(201).json({
                message: 'Item successfully updated',
                success: true,
            });
        } catch (err) {
            return res.status(500).json({
                message: err.message,
                success: false
            })
        }
    },

    getOne: async (req, res) => {
        try {
            const item = await Users.findOne({ where: { sn: req.params.id}, attributes: {exclude: ['password']}});
            if(item) {
                return res.status(200).json(item);
            }
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        } catch (err) {
            return res.status(500).json({
                message: err.message,
                success: false
            })
        }
    }
}

module.exports = profileCtrl