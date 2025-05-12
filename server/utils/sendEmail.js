import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS // Используйте пароль приложения здесь
      }
    });

    const mailOptions = {
      from: `"WorklyApp" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email отправлен:', info.messageId);
    return true;
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    return false;
  }
};

export default sendEmail;

