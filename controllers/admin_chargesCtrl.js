const model = require("../models");
const AdminCharges = model.admincharges;
const Users = model.users;

const adminChargesCtrl = {
  createAdminCharges: async (data) => {
    try {
      const date = new Date();
      const formattedDate = (date.getMonth() + 1).toString().padStart(2, '0') + '/' 
                   + date.getDate().toString().padStart(2, '0') + '/' 
                   + date.getFullYear();
      const newTransaction = await AdminCharges.create({
        owner: data.owner,
        amount: data.amount,
        status: data.status,
        product: data.product,
        type: data.type,
        game: data.game,
        dateadded: formattedDate,
        id: data.id,
      });
      return { success: true, newTransaction };
    } catch (error) {
      console.error(error.message);
      return { success: false, message: error.message }; 
    }
  },
  fetchAllAdminCharges: async (req, res, next) => {
    try {
      const transactions = await AdminCharges.findAll({ order: [['sn', 'DESC']]  });
      return res.status(200).json({ success: true, transactions });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: err.message, success: false });
    }
  },

  fetchAdminChargesDetails: async (req, res, next) => {
    try {
      const { id } = req.params;
      const transaction = await AdminCharges.findOne({ 
        where: { sn: id },
        order: [['sn', 'DESC']] 
       });
      if (transaction) {
        res.status(200).json({ success: true, transaction });
      } else {
        res.status(404).json({ success: false, message: "Record not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  fetchUserAdminCharges: async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const user = await Users.findOne({ where: { sn: user_id } });
      const transaction = await AdminCharges.findAll({
        where: { owner: user.email },
        order: [['sn', 'DESC']] 
      });
      if (transaction) {
        res.status(200).json({ success: true, transaction });
      } else {
        res.status(404).json({ success: false, message: "Record not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteAdminCharge: async (req, res, next) => {
    try {
      const { id } = req.params;
      const transaction = await AdminCharges.deleteOne({
        where: { sn: id },
      });
      if (transaction) {
        res
          .status(200)
          .json({ success: true, message: "Admin Charges record deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Record not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = adminChargesCtrl;