const nodemailer = require('nodemailer');
const Email = require('email-templates');

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'FROM'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        throw new Error(`Environment variable ${env} is required`);
    }
});

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SSL === 'true', 
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});

const email = new Email({
    views: { 
        root: "email_templates",
        options: { extension: "ejs" },
    },
    message: {
        from: process.env.FROM
    },
    send: true,
    transport: transporter
});

module.exports = { email };
