module.exports = (sequelize, Sequelize) => {
    const wallet = sequelize.define('wallets', {
        accountNumber: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false
        },
        user: {
            type: Sequelize.STRING,
            allowNull: false
        },
        accountName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        balance: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        bankCode: {
            type: Sequelize.STRING,
            allowNull: false
        },
        bankName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        publicId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        sn: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false
    });

    return wallet;
}