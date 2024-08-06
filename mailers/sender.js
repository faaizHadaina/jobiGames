const { email } = require('./config');

const welcomeSender = async (recipient, name, code) => {
    try {
        console.log(`Sending welcome email to ${recipient}`);
        await email.send({
            template: 'welcome',
            message: { to: recipient },
            locals: { name, code }
        });
        console.log(`Welcome email sent successfully to ${recipient}`);
    } catch (error) {
        console.error(`Error sending welcome email to ${recipient}:`, error);
    }
};

const forgotPasswordSender = async (recipient, name, code) => {
    try {
        console.log(`Sending forgot password email to ${recipient}`);
        await email.send({
            template: 'forgot',
            message: { to: recipient },
            locals: { name, code }
        });
        console.log(`Forgot password email sent successfully to ${recipient}`);
    } catch (error) {
        console.error(`Error sending forgot password email to ${recipient}:`, error);
    }
};

const onboardingSender = async (recipient, name) => {
    try {
        console.log(`Sending onboarding email to ${recipient}`);
        await email.send({
            template: 'onboarding',
            message: { to: recipient },
            locals: { name }
        });
        console.log(`Onbaording email sent successfully to ${recipient}`);
    } catch (error) {
        console.error(`Error sending Onbaording email to ${recipient}:`, error);
    }
};

module.exports = {    
    welcomeSender,
    forgotPasswordSender,
    onboardingSender
};