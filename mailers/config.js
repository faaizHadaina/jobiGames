const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');

try {
    const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'FROM', 'SMTP_SSL'];
    requiredEnv.forEach(env => {
        if (!process.env[env]) {
            throw new Error(`Environment variable ${env} is required`);
        }
    });

    const transporter = nodemailer.createTransport({
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
            root: path.join(__dirname, "email_templates"),
            options: { 
                extension: "ejs" 
            },
        },
        message: {
            from: `${process.env.FROM_NAME} <${process.env.FROM}>`
        },
        send: true,
        preview: false, 
        transport: transporter
    });

    module.exports = { email };

} catch (error) {
    console.error('Error initializing email configuration:', error.message);
}
