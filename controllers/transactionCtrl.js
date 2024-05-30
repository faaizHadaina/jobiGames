const model = require("../models");
const Transaction = model.transactions;
const Users = model.users;

const transactionCtrl = {
  createTransaction: async (data) => {
    try {
      const date = new Date();
      const formattedDate = (date.getMonth() + 1).toString().padStart(2, '0') + '/' 
                   + date.getDate().toString().padStart(2, '0') + '/' 
                   + date.getFullYear();
      const newTransaction = await Transaction.create({
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

  fetchAllTransactions: async (req, res, next) => {
    try {
        const user = await Users.findOne({ where: { sn: req.user.sn } });
        const transactions = await Transaction.findAll({ 
          where: { owner: user.email },
          order: [['sn', 'DESC']]  
        });
      return res.status(200).json({ success: true, transactions });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: err.message, success: false });
    }
  },

  fetchTransactionDetails: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await Users.findOne({ where: { sn: req.user.sn } });
      const transaction = await Transaction.findOne({ 
        where: { sn: id, owner: user.email },
        order: [['sn', 'DESC']] 
       });
      if (transaction) {
        res.status(200).json({ success: true, transaction });
      } else {
        res.status(404).json({ success: false, message: "Transaction not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  fetchUserTransactionRecords: async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const user = await Users.findOne({ where: { sn: user_id } });
      console.log(user)
      const transaction = await Transaction.findAll({ 
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

  deleteTransactionRecord: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await Users.findOne({ where: { sn: req.user.sn } });
      const transaction = await Transaction.deleteOne({
        where: { sn: id, owner: user.email },
      });
      if (transaction) {
        res
          .status(200)
          .json({ success: true, message: "Transaction record deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Transaction record not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = transactionCtrl;