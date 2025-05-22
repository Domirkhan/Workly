import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from 'colors/safe';  // Используем безопасный импорт

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI отсутствует в переменных окружения');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(colors.green(`MongoDB подключена: ${conn.connection.host}`));
  } catch (error) {
    console.error(colors.red(`Ошибка подключения к MongoDB: ${error}`));
    process.exit(1);
  }
};

export default connectDB;