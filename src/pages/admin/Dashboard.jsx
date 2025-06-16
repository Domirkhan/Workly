import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatTime } from '../../utils/formatTime';
import { employeeApi, timesheetApi } from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeHours, setEmployeeHours] = useState([]);
  const [dailyHoursData, setDailyHoursData] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

const fetchDashboardData = async () => {
  try {
    setIsLoading(true);
    setError(null);

    // Получаем данные сотрудников и записи времени параллельно
    const [employeesData, timesheetData] = await Promise.all([
      employeeApi.getAll(),
      timesheetApi.getAll()
    ]);

    // Инициализация объектов для расчетов
    const hoursMap = {};
    let totalRevenue = 0;
    const dailyHours = {};

    // Обработка записей времени
    timesheetData.forEach((record) => {
      // Учитываем только завершенные записи
      if (record.status === 'completed') {
        const employeeId = record.employeeId || record.employee;
        
        // Расчет часов по сотрудникам
        if (record.totalHours && employeeId) {
          hoursMap[employeeId] = (hoursMap[employeeId] || 0) + Number(record.totalHours);
        }
        
        // Расчет выручки
        if (record.calculatedPay) {
          totalRevenue += Number(record.calculatedPay);
        }
        
        // Расчет ежедневных часов для графика
        if (record.totalHours && record.date) {
          const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
          dailyHours[dateKey] = (dailyHours[dateKey] || 0) + Number(record.totalHours);
        }
      }
    });

    // Формирование данных сотрудников с часами
    const employeesWithHours = employeesData
      .map(employee => ({
        id: employee._id || employee.id,
        name: employee.name,
        position: employee.position,
        totalHours: Number((hoursMap[employee._id || employee.id] || 0).toFixed(1)),
        hourlyRate: employee.hourlyRate || 0
      }))
      .sort((a, b) => b.totalHours - a.totalHours); // Сортировка по убыванию часов

    // Форматирование данных для графика
    const chartData = Object.entries(dailyHours)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7) // Показываем только последние 7 дней
      .map(([date, hours]) => ({
        date: format(new Date(date), 'dd.MM'),
        hours: Number(hours.toFixed(1))
      }));

    // Обновление состояний
    setEmployeeHours(employeesWithHours);
    setDailyHoursData(chartData);
    setStats({
      totalEmployees: employeesData.length,
      activeEmployees: employeesData.filter(emp => emp.status === 'active').length,
      totalRevenue: Number(totalRevenue.toFixed(2))
    });

  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    setError(error.message || 'Произошла ошибка при загрузке данных');
  } finally {
    setIsLoading(false);
  }
};

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p>Загрузка данных...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-red-500">Ошибка: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Главная</h1>
          <p className="text-slate-500">Добро пожаловать, Админ!</p>
        </div>
        <div>
          <Button 
            variant="primary"
            onClick={() => navigate('/admin/add-employee')}
            leftIcon={<PlusCircle size={20} />}
            className="shadow-lg hover:shadow-2xl transition-all"
          >
            Добавить сотрудника
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
        <Card className="bg-white border border-slate-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-3">Всего сотрудников</p>
              <p className="text-5xl font-light text-slate-900">{stats.totalEmployees}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-3">Активных сотрудников</p>
              <p className="text-5xl font-light text-green-600">{stats.activeEmployees}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-3">Общая выручка</p>
              <p className="text-5xl font-light text-blue-600">{stats.totalRevenue.toFixed(0)} тг</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* График часов */}
        <Card className="bg-white border border-slate-200 hover:shadow-lg transition-shadow">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-xl font-light text-slate-800">
              Тренд отработанных часов
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              {dailyHoursData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyHoursData}>
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="hours" 
                      fill="#e2e8f0" 
                      radius={[4, 4, 0, 0]}
                      name="Часов"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Нет данных для отображения</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Таблица рейтинга */}
        <Card className="bg-white border border-slate-200 hover:shadow-lg transition-shadow">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-xl font-light text-slate-800">
              Рейтинг по отработанным часам
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Место
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Сотрудник
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Должность
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Часы
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeHours.map((employee, index) => (
                    <tr 
                      key={employee.id || index}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium whitespace-nowrap">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium text-right whitespace-nowrap">
                        {formatTime(employee.totalHours)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {employeeHours.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">Нет данных для отображения</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}