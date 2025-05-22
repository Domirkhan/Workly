import { useNavigate } from 'react-router-dom';
import { Clock, Users, CreditCard, LineChart, Award, ArrowRight, CheckCircle } from 'lucide-react';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';

export default function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                Войти
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => navigate('/register')}
              >
                Регистрация
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Главная секция */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="fade-in">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Удобный учет рабочего времени и расчет зарплаты
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                Отслеживайте часы работы сотрудников, автоматически рассчитывайте зарплату.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => navigate('/register')}
                  rightIcon={<ArrowRight />}
                >
                  Начать бесплатно
                </Button>
              </div>
            </div>
            <div className="hidden md:block slide-in-right">
              <div className="glass-card p-6 bg-white/10 border-white/20">
                <div className="aspect-video bg-gradient-to-br from-blue-800 to-teal-700 rounded-lg shadow-xl flex items-center justify-center">
                  <Clock className="w-24 h-24 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Секция возможностей */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Все необходимое для учета времени и расчета зарплаты
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Комплексное решение для бизнеса любого размера
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-6 scale-in">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Учет времени</h3>
              <p className="text-slate-600">
                Легко отслеживайте рабочее время с помощью интуитивной системы учета.
              </p>
            </div>
            <div className="card p-6 scale-in">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Автоматический расчет</h3>
              <p className="text-slate-600">
                Автоматически рассчитывайте зарплату на основе отработанных часов.
              </p>
            </div>
            <div className="card p-6 scale-in">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Управление командой</h3>
              <p className="text-slate-600">
                Удобное добавление и управление сотрудниками в одном месте.
              </p>
            </div> 
            <div className="card p-6 scale-in">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 mb-4">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Отчеты и аналитика</h3>
              <p className="text-slate-600">
                Получайте наглядные отчеты по посещаемости, часам и затратам.
              </p>
            </div>
            <div className="card p-6 scale-in">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Разные уровни доступа</h3>
              <p className="text-slate-600">
                Настраивайте разные права доступа для руководителей и сотрудников.
              </p>
            </div>
            <div className="card p-6 scale-in">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Простая настройка</h3>
              <p className="text-slate-600">
                Начните работу за считанные минуты с нашим простым интерфейсом.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Секция призыва к действию */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 shadow-xl text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Готовы улучшить учет рабочего времени?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Присоединяйтесь к тысячам компаний, которые уже упростили расчет зарплаты.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate('/register')}
                rightIcon={<ArrowRight />}
              >
                Попробовать бесплатно 14 дней
              </Button>
              <p className="mt-4 text-blue-200 text-sm">
                Без привязки карты. Отмена в любое время.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Подвал */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo />
            <div className="mt-4 md:mt-0">
              <p className="text-slate-500 text-sm">
                © 2025 Workly. Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}