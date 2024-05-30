const crypto = require("crypto");
const adminChargesCtrl = require("../../controllers/admin_chargesCtrl");

const crypto = require("crypto");

async function createAdminCharges(users, amount) {
  if (!Array.isArray(users)) {
    users = [users]; 
  }

  try {
    const adminCharges = await Promise.all(users.map(async (user) => {
      const userTxId = `tx${crypto.randomBytes(8).toString("hex")}`;
      const data = {
        owner: user.email,
        amount: amount,
        status: "Completed",
        product: "RM Coins",
        type: "Credit",
        game: 'Universal',
        id: userTxId,
      };

      return await adminChargesCtrl.createAdminCharges(data);
    }));

    return adminCharges;
  } catch (error) {
    console.error("Error creating records:", error);
    throw error;
  }
}

module.exports = createAdminCharges;
