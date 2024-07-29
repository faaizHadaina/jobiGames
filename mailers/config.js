const nodemailer = require('nodemailer');
const Email = require('email-templates');

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'FROM'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        throw new Error(`Environment variable ${env} is required`);
    }
});

let transporter;
try {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, 
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('Error configuring SMTP transporter:', error);
        } else {
            console.log('SMTP transporter configured successfully');
        }
    });
} catch (error) {
    console.error('Error creating SMTP transporter:', error.message);
}

let email;
try {
    email = new Email({
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

    console.log('Email configuration created successfully');
} catch (error) {
    console.error('Error initializing email configuration:', error.message);
}

module.exports = { email };
