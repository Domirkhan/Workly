import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, html) => {
  try {
    // Создаем транспорт
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Используем сервис Gmail
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS // Используйте пароль приложения
      }
    });

    console.log('Отправка письма на:', email);

    // Отправляем письмо
    const info = await transporter.sendMail({
      from: `"WorklyApp" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: html
    });

    console.log('Письмо отправлено:', info.messageId);
    return true;
  } catch (error) {
    console.error('Ошибка отправки email:', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export default sendEmail;