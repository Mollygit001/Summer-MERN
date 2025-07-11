import nodeMailer from 'nodemailer';

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({to, subject, text}) => {
    const mailOptions = {
        to: to,
        subject: subject,
        text: text,
        from: process.env.EMAIL_USER
    };

    try{
        await transporter.sendMail(mailOptions);
    }
    catch(error){
        console.error('Error sending email:', error);
        throw new Error('Email sending failed');
    }
}

export default sendEmail;   