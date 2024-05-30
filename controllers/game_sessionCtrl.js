const model = require("../models");
const createTransactions = require("../utils/functions/recordTransaction");
const createAdminCharges = require("../utils/functions/recordAdminCharges");
const GameSessions = model.sessions;
const Users = model.users;
const crypto = require("crypto");

const gameSessionCtrl = {
  handleGameSession: async (req, res, next) => {
    try {
      const { room_id, game_id, room_pass, coin } = req.body;
      const user_id = req.user.sn;

      const user = await Users.findOne({ where: { sn: user_id } });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Authentication failed", success: false });
      }

      if (user.balance < coin) {
        return res.status(400).json({
          success: false,
          message:
            "Insufficient balance. Please add more funds to your account.",
        });
      }

      const existingRoom = await GameSessions.findOne({
        where: { room_id, game_id, status: "Waiting" },
      });

      if (existingRoom) {
        const opponent_id = req.user.sn;
        if (existingRoom.user_id === opponent_id) {
          return res.status(201).json({
            message: "Room created",
            success: true,
            room: existingRoom,
          });
        }

        const opponent = await Users.findOne({ where: { sn: opponent_id } });
        if (!opponent) {
          return res
            .status(404)
            .json({ success: false, message: "Opponent not found" });
        }

        const newOpponentBalance = parseFloat(opponent.balance) - coin;
        opponent.balance = newOpponentBalance.toFixed(2);
        await opponent.save();

        const creator = await Users.findOne({
          where: { sn: existingRoom.user_id },
        });
        const newUserBalance = parseFloat(creator.balance) - coin;
        creator.balance = newUserBalance.toFixed(2);
        await creator.save();

        await existingRoom.update({
          opponent_id: opponent_id,
          status: "Filled",
        });

        const data = {
          amount: coin,
          product: "RM Coins",
          type: "Debit",
        };

        await createTransactions([creator, opponent], data);

        return res.status(200).json({
          success: true,
          message: "Opponent connected",
          room: existingRoom,
        });
      } else {
        const newRoom = await GameSessions.create({
          room_id,
          game_id,
          room_pass,
          user_id,
          coin,
          room_owner: user_id,
          status: "Waiting",
          date_created: new Date(),
        });

        return res.status(201).json({
          message: "Room created",
          success: true,
          room: newRoom,
        });
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: err.message, success: false });
    }
  },

  fetchAllGameSessions: async (req, res, next) => {
    try {
      const gameSessions = await GameSessions.findAll();
      return res.status(200).json({ success: true, gameSessions });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: err.message, success: false });
    }
  },

  fetchGameSessionDetails: async (req, res, next) => {
    try {
      const { room_id, game_id } = req.params;
      const room = await GameSessions.findOne({ where: { room_id, game_id } });
      if (room) {
        res.status(200).json({ success: true, room });
      } else {
        res.status(404).json({ success: false, message: "Room not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteGameSession: async (req, res, next) => {
    try {
      const { room_pass, game_id } = req.params;
      const user_id = req.user.sn;

      const user = await Users.findOne({ where: { sn: user_id } });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Authentication failed", success: false });
      }

      const room = await GameSessions.findOne({
        where: { room_pass, game_id, user_id },
      });

      if (room && (room.status === "Waiting" || room.opponent_id === null)) {
        await GameSessions.destroy({
          where: { room_pass, game_id, user_id },
        });

        res
          .status(200)
          .json({ success: true, message: "Room deleted successfully" });
      } else if (!room) {
        res.status(403).json({
          success: false,
          message: "Room cannot be found ",
        });
      } else {
        const sessionCoin = room.coin * 2;
        const adminChargeRate = sessionCoin > 1000000 ? 0.05 : 0.1;
        const adminCharge = adminChargeRate * sessionCoin;
        const amountToAdd = parseFloat(sessionCoin - adminCharge);

        const userToCredit =
          room.user_id === user_id ? room.opponent_id : room.user_id;

        const opponent = await Users.findOne({ where: { sn: userToCredit } });
        if (!opponent) {
          return res
            .status(404)
            .json({ message: "Opponent Not Found", success: false });
        }

        const currentBalance = parseFloat(opponent.balance);
        const newBalance = currentBalance + amountToAdd;

        const data = {
          amount: amountToAdd,
          product: "RM Coins",
          type: "Credit",
        };

        await createTransactions([opponent], data);
        await createAdminCharges([opponent], parseFloat(adminCharge));

        await opponent.update({ balance: newBalance });

        await GameSessions.destroy({
          where: { room_pass, game_id, user_id },
        });

        res.status(200).json({
          success: true,
          message: "Room deleted successfully and opponent credited",
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  connectOpponent: async (req, res, next) => {
    try {
      const { room_id, game_id, room_pass } = req.body;
      const opponent_id = req.user.sn;

      const room = await GameSessions.findOne({ where: { room_id, game_id } });

      if (!room) {
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });
      }

      if (room.room_pass !== room_pass) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect Room Password" });
      }

      if (room.user_id === opponent_id) {
        return res.status(400).json({
          success: false,
          message: "Creator of the game session cannot join as an opponent",
        });
      }

      if (room.status === "filled" || room.opponent_id) {
        return res
          .status(400)
          .json({ success: false, message: "Room is already filled" });
      }

      const opponent = await Users.findOne({ where: { sn: opponent_id } });
      const creator = await Users.findOne({ where: { sn: room.user_id } });
      if (!opponent) {
        return res
          .status(404)
          .json({ success: false, message: "Opponent not found" });
      }

      if (parseFloat(opponent.balance) < room.coin) {
        return res.status(400).json({
          success: false,
          message:
            "Insufficient Balance to join this game. Please add more funds to your account",
        });
      }

      opponent.balance -= room.coin;
      creator.balance -= room.coin;

      await opponent.save();
      await creator.save();

      await room.update({ opponent_id: opponent_id, status: "filled" });

      res.status(200).json({
        success: true,
        message: "Opponent connected successfully",
        room,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  endGameSession: async (req, res, next) => {
    try {
      const { session_id, user_id } = req.params;

      const session = await GameSessions.findOne({ where: { id: session_id } });
      if (!session) {
        return res
          .status(404)
          .json({ message: "Game Session Not Found", success: false });
      }

      const user = await Users.findOne({ where: { sn: user_id } });
      if (!user) {
        return res
          .status(404)
          .json({ message: "User Not Found", success: false });
      }

      const sessionCoin = session.coin * 2;
      const adminChargeRate = sessionCoin > 1000000 ? 0.05 : 0.1;
      const adminCharge = adminChargeRate * sessionCoin;
      const amountToAdd = parseFloat(sessionCoin - adminCharge);
      const currentBalance = parseFloat(user.balance);

      const newBalance = currentBalance + amountToAdd;

      const data = {
        amount: amountToAdd,
        product: "RM Coins",
        type: "Credit",
      };

      await createTransactions([user], data);
      await createAdminCharges([user], parseFloat(adminCharge));

      await user.update({ balance: newBalance });

      res.status(200).json({
        success: true,
        message: "Game session ended successfully",
        winnerBalance: newBalance,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  sendReplayRequest: async (req, res, next) => {
    try {
      const { session_id } = req.params;
      const user_id = req.user.sn;
      const numericUserId = parseInt(user_id, 10);

      const session = await GameSessions.findOne({ where: { id: session_id } });
      if (!session) {
        return res
          .status(404)
          .json({ message: "Game Session Not Found", success: false });
      }

      if (
        !(
          parseInt(session.user_id, 10) === numericUserId ||
          parseInt(session.opponent_id, 10) === numericUserId
        )
      ) {
        return res.status(403).json({
          message: "User not authorized for this game session",
          success: false,
        });
      }

      if (session.status !== "Filled") {
        return res.status(400).json({
          message: "Game session must be 'Filled' to request a replay",
          success: false,
        });
      }

      const user = await Users.findOne({ where: { sn: numericUserId } });
      if (!user) {
        return res
          .status(404)
          .json({ message: "User Not Found", success: false });
      }

      if (parseFloat(user.balance) < parseFloat(session.coin)) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance to request a game session replay",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Replay request sent successfully. Waiting for opponent's response.",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  acceptReplayRequest: async (req, res, next) => {
    try {
      const { session_id } = req.params;
      const user_id = req.user.sn;
      const numericUserId = parseInt(user_id, 10);

      const session = await GameSessions.findOne({ where: { id: session_id } });
      if (!session) {
        return res
          .status(404)
          .json({ message: "Game Session Not Found", success: false });
      }

      if (
        !(
          parseInt(session.user_id, 10) === numericUserId ||
          parseInt(session.opponent_id, 10) === numericUserId
        )
      ) {
        return res.status(403).json({
          message: "User not authorized for this game session",
          success: false,
        });
      }

      const user = await Users.findOne({ where: { sn: numericUserId } });
      if (!user) {
        return res
          .status(404)
          .json({ message: "User Not Found", success: false });
      }

      const opponentId =
        session.user_id === numericUserId
          ? session.opponent_id
          : session.user_id;
      const opponent = await Users.findOne({ where: { sn: opponentId } });
      if (!opponent) {
        return res
          .status(404)
          .json({ message: "Opponent Not Found", success: false });
      }

      if (parseFloat(user.balance) < parseFloat(session.coin)) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance to accept or restart the game session",
        });
      }

      user.balance -= session.coin;
      opponent.balance -= session.coin;

      await user.save();
      await opponent.save();

      const data = {
        amount: session.coin,
        product: "RM Coins",
        type: "Debit",
      };

      await createTransactions([user, opponent], data);

      res.status(200).json({
        success: true,
        message: "Game session replay accepted and restarted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = gameSessionCtrl;
