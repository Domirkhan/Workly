import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Clock, DollarSign, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../utils/formatTime';

import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useTimesheetStore } from '../../stores/timesheetStore';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { records, fetchEmployeeRecords, clockIn } = useTimesheetStore();
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEarnings: 0,
    hoursThisWeek: 0,
    attendanceRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
  
      try {
        setIsLoading(true);
        setError(null); // Сбрасываем ошибку перед новым запросом
        
        // Получаем записи
        await fetchEmployeeRecords(user.id);
        
        // Получаем статистику
        const response = await fetch('/api/v1/timesheet/employee/stats', {
          headers: {
            'Content-Type': 'application/json',
            // Добавьте заголовки авторизации, если требуется
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при получении статистики');
        }
  
        const statsData = await response.json();
        console.log('Полученная статистика:', statsData); // Для отладки
        
        setStats({
          totalHours: statsData.totalHours || 0,
          totalEarnings: statsData.totalEarnings || 0,
          hoursThisWeek: statsData.hoursThisWeek || 0,
          attendanceRate: statsData.attendanceRate || 0
        });
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [user, fetchEmployeeRecords]);

  // Проверяем текущую отметку
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentRecord = records.find(record => 
    record.date === today && record.clockOut === null
  );

  // Подготавливаем данные для графика
  const chartData = records
    .filter(record => record.totalHours)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map(record => ({
      date: format(new Date(record.date), 'EEE', { locale: ru }),
      hours: record.totalHours
    }));

  const handleClockIn = () => {
    if (user) {
      clockIn(user.id);
      navigate('/employee/clock');
    }
  };

  const handleClockOut = () => {
    navigate('/employee/clock');
  };

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="flex justify-center items-center h-96">
          <p>Загрузка данных...</p>
        </div>
      </EmployeeLayout>
    );
  }

  if (error) {
    return (
      <EmployeeLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-red-500">Ошибка: {error}</p>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Добро пожаловать, {user?.name}!
        </h1>
        <p className="text-slate-500">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ru })}
        </p>
      </div>

      {/* Карточка отметки времени */}
      <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Учет времени</h2>
              <p className="text-blue-100">
                {currentRecord 
                  ? `Вы начали работу в ${format(new Date(currentRecord.clockIn), 'HH:mm')}` 
                  : 'Вы еще не начали рабочий день'
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              {currentRecord ? (
                <Button 
                  variant="secondary"
                  size="lg"
                  onClick={handleClockOut}
                >
                  Завершить работу
                </Button>
              ) : (
                <Button 
                  variant="secondary"
                  size="lg"
                  onClick={handleClockIn}
                >
                  Начать работу
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="scale-in" variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-4">
                <Clock className="w-6 h-6" />
              </div>
             <div>
              <p className="text-sm font-medium text-slate-500">Всего часов</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {formatTime(stats.totalHours)}
              </h3>
              <p className="text-xs text-blue-600">За все время</p>
            </div>
            </div>
          </CardContent>
        </Card>

        <Card className="scale-in" variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Общий заработок</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.totalEarnings.toFixed(2)}тг
                </h3>
                <p className="text-xs text-teal-600">За все время</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="scale-in" variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mr-4">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
               <p className="text-sm font-medium text-slate-500">Эта неделя</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {formatTime(stats.hoursThisWeek)}
                </h3>
                <p className="text-xs text-amber-600">Отработано часов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="scale-in" variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-800 mr-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Посещаемость</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.attendanceRate}%
                </h3>
                <p className="text-xs text-green-600">Своевременные приходы</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
    </EmployeeLayout>
  );
}