const crypto = require("crypto");
const transactionCtrl = require("../../controllers/transactionCtrl");

async function createTransactions(users, transactionData) {
  if (!Array.isArray(users)) {
    users = [users]; 
  }

  try {
    const transactions = await Promise.all(users.map(async (user) => {
      const userTxId = `tx${crypto.randomBytes(8).toString("hex")}`;
      const transactionDetails = {
        owner: user.email,
        amount: transactionData.amount,
        status: "Completed",
        product: transactionData.product,
        type: transactionData.type,
        game: 'Universal',
        id: userTxId,
      };

      return await transactionCtrl.createTransaction(transactionDetails);
    }));

    return transactions;
  } catch (error) {
    console.error("Error creating transactions:", error);
    throw error;
  }
}

module.exports = createTransactions;
