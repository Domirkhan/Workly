import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, html) => {
  try {
    // Создаем транспорт с правильными настройками
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true для порта 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Опции письма
    const mailOptions = {
      from: `"WorklyApp" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: subject,
      html: html
    };

    // Отправляем письмо
    const info = await transporter.sendMail(mailOptions);
    console.log('Email успешно отправлен:', info.messageId);
    return true;
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    throw error; // Пробрасываем ошибку для обработки в контроллере
  }
};

export default sendEmail;