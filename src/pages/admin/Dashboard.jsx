import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Clock } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useTimesheetStore } from '../../stores/timesheetStore';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';


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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Загружаем данные сотрудников
        const employeesResponse = await fetch('/api/employees');
        const employeesData = await employeesResponse.json();

        // Загружаем записи времени
        const recordsResponse = await fetch('/api/timesheet/all');
        const recordsData = await recordsResponse.json();

        // Расчёт часов по сотрудникам
        const hoursMap = {};
        let totalRevenue = 0;

        recordsData.forEach((record) => {
          if (record.totalHours && record.employee?._id) {
            hoursMap[record.employee._id] = (hoursMap[record.employee._id] || 0) + record.totalHours;
            if (record.calculatedPay) {
              totalRevenue += record.calculatedPay;
            }
          }
        });

        // Создаем массив с данными сотрудников и их часами
        const employeesWithHours = employeesData.map(employee => ({
          id: employee._id,
          name: employee.name,
          position: employee.position,
          totalHours: hoursMap[employee._id] || 0,
          hourlyRate: employee.hourlyRate || 0
        }));

        // Сортируем по убыванию часов
        employeesWithHours.sort((a, b) => b.totalHours - a.totalHours);
        setEmployeeHours(employeesWithHours);

        // Расчёт суммарных часов по датам для графика
        const dailyHours = {};
        recordsData.forEach((record) => {
          if (record.totalHours) {
            const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
            dailyHours[dateKey] = (dailyHours[dateKey] || 0) + record.totalHours;
          }
        });

        // Сортируем даты и форматируем для графика
        const chartData = Object.entries(dailyHours)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, hours]) => ({
            date: format(new Date(date), 'dd.MM'),
            hours: Number(hours.toFixed(1))
          }));

        setDailyHoursData(chartData);

        // Обновляем статистику
        setStats({
          totalEmployees: employeesData.length,
          activeEmployees: employeesData.filter(emp => emp.status === 'active').length,
          totalRevenue: totalRevenue
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <h1 className="text-2xl font-bold text-slate-900 ">Главная</h1>
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
      
       {/* Обновленные карточки статистики */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
        <Card className="bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-3">Всего сотрудников</p>
              <p className="text-5xl font-light text-slate-900">{stats.totalEmployees}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-3">Активных сотрудников</p>
              <p className="text-5xl font-light text-green-600">{stats.activeEmployees}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-3">Общая выручка</p>
              <p className="text-5xl font-light text-blue-600">{stats.totalRevenue.toFixed(0)} тг</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Обновленные графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
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

        {/* Обновленная таблица рейтинга */}
        <Card className="bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Место</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Сотрудник</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Должность</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Часы</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeHours.map((employee, index) => (
                    <tr 
                      key={employee.id} 
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
                        {employee.totalHours.toFixed(1)}
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