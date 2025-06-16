import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Clock, DollarSign, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  // Получаем данные сотрудника из БД
useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Получаем основные данные сотрудника
        const employeeResponse = await fetch(
          `https://workly-backend.onrender.com/api/v1/employees/${id}`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        if (!employeeResponse.ok) throw new Error('Не удалось загрузить данные сотрудника');
        const employeeData = await employeeResponse.json();
        setEmployee(employeeData);
        setFormData(employeeData);

        // Получаем статистику сотрудника
        const statsResponse = await fetch(
          `https://workly-backend.onrender.com/api/v1/timesheet/employee/${id}/stats`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        if (!statsResponse.ok) throw new Error('Не удалось загрузить статистику');
        const statsData = await statsResponse.json();
        setStats(statsData);

      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hourlyRate' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Сохраняет изменения сотрудника в БД
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://workly-backend.onrender.com/api/v1/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        throw new Error('Update failed');
      }
      const updatedEmployee = await res.json();
      setEmployee(updatedEmployee);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };
  
  // Удаление сотрудника
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      try {
        const res = await fetch(`https://workly-backend.onrender.com/api/v1/employees/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          throw new Error('Delete failed');
        }
        navigate('/admin/employees');
      } catch (error) {
        console.error(error);
      }
    }
  };
  
  if (!employee) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p>Loading employee data...</p>
        </div>
      </AdminLayout>
    );
  }
  
  // Для примера расчитаем статистику, если у сотрудника есть записи (в вашем API их можно получить отдельно)
  const totalHours = employee.records ? employee.records.reduce((sum, rec) => sum + (rec.totalHours || 0), 0) : 0;
  const totalEarnings = employee.records ? employee.records.reduce((sum, rec) => sum + (rec.calculatedPay || 0), 0) : 0;
  
   return (
    <AdminLayout>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/employees')}
          className="flex items-center text-slate-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Вернуться к списку
        </button>
        
        {employee && (
          <>
            <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
            <p className="text-slate-500">{employee.position}</p>
          </>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {isEditing ? (
            <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">ФИО</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={formData.name || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="position" className="form-label">Должность</label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  className="form-input"
                  value={formData.position || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="hourlyRate" className="form-label">Почасовая ставка (тг)</label>
                <input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={formData.hourlyRate || 0}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="status" className="form-label">Статус</label>
                <select
                  id="status"
                  name="status"
                  className="form-input"
                  value={formData.status || 'active'}
                  onChange={handleChange}
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                </select>
              </div>
            </form>
          ) : (
            employee && (
              <div className="space-y-4">
                <div className="flex items-center py-2 border-b border-slate-100">
                  <User className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500">ФИО</p>
                    <p className="font-medium">{employee.name}</p>
                  </div>
                </div>
                <div className="flex items-center py-2 border-b border-slate-100">
                  <Mail className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center py-2 border-b border-slate-100">
                  <DollarSign className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500">Почасовая ставка</p>
                    <p className="font-medium">{employee.hourlyRate} тг/час</p>
                  </div>
                </div>
                <div className="flex items-center py-2 border-b border-slate-100">
                  <Clock className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500">Статус</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'active' ? 'Активен' : 'Неактивен'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center py-2 border-b border-slate-100">
                  <Calendar className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500">Дата начала работы</p>
                    <p className="font-medium">
                      {format(new Date(employee.joinDate), 'd MMMM yyyy', { locale: ru })}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </CardContent>
        {!isEditing ? (
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Редактировать
            </Button>
          </CardFooter>
        ) : (
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
            <Button type="submit" form="edit-employee-form">
              Сохранить
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Всего часов</p>
              <p className="text-2xl font-bold">{stats.totalHours?.toFixed(1) || '0'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-800 mb-2">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Общий заработок</p>
              <p className="text-2xl font-bold">{stats.totalEarnings?.toFixed(0) || '0'} тг</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Среднее часов/день</p>
              <p className="text-2xl font-bold">{stats.avgHoursPerDay?.toFixed(1) || '0'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}