import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, html) => {
  try {
    // Создаем транспорт с более детальными настройками
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // для порта 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // Не проверяем сертификат
        rejectUnauthorized: false
      }
    });

    // Добавляем логирование для отладки
    console.log('Настройки SMTP:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER
    });

    const mailOptions = {
      from: `"WorklyApp" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: subject,
      html: html
    };

    console.log('Отправка письма на:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email успешно отправлен:', info.messageId);
    return true;
  } catch (error) {
    console.error('Детальная ошибка отправки email:', {
      message: error.message,
      stack: error.stack
    });
    throw error; // Пробрасываем ошибку для лучшей обработки
  }
};

export default sendEmail;