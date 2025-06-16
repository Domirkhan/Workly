import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Clock, DollarSign, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const response = await fetch(
          `https://workly-backend.onrender.com/api/v1/employees/${id}`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error('Не удалось загрузить данные сотрудника');
        }
        
        const data = await response.json();
        setEmployee(data);
        setFormData(data);
      } catch (error) {
        console.error('Ошибка загрузки данных сотрудника:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hourlyRate' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://workly-backend.onrender.com/api/v1/employees/${id}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error('Не удалось обновить данные сотрудника');
      }

      const updatedEmployee = await response.json();
      setEmployee(updatedEmployee);
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://workly-backend.onrender.com/api/v1/employees/${id}`,
          {
            method: 'DELETE',
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error('Не удалось удалить сотрудника');
        }

        navigate('/admin/employees');
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
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

  if (!employee) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p>Сотрудник не найден</p>
        </div>
      </AdminLayout>
    );
  }

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
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Профиль сотрудника</h1>
            <p className="text-slate-500">{employee.name}</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Edit size={16} />}
                onClick={() => setIsEditing(true)}
              >
                Изменить
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={handleDelete}
            >
              Удалить
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Информация о сотруднике</CardTitle>
        </CardHeader>
        <CardContent>
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
                <label htmlFor="hourlyRate" className="form-label">Почасовая ставка</label>
                <input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="100"
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
              <div>
                <label htmlFor="joinDate" className="form-label">Дата начала работы</label>
                <input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  className="form-input"
                  value={formData.joinDate ? formData.joinDate.split('T')[0] : ''}
                  onChange={handleChange}
                />
              </div>
            </form>
          ) : (
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
                <User className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs text-slate-500">Должность</p>
                  <p className="font-medium">{employee.position || 'Не указана'}</p>
                </div>
              </div>
              <div className="flex items-center py-2 border-b border-slate-100">
                <DollarSign className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs text-slate-500">Почасовая ставка</p>
                  <p className="font-medium">{employee.hourlyRate.toFixed(2)}тг</p>
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
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Отмена</Button>
            <Button type="submit" form="edit-employee-form">Сохранить</Button>
          </CardFooter>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Всего часов</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 mb-2">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Общий заработок</p>
              <p className="text-2xl font-bold">{totalEarnings.toFixed(2)}тг</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Средние часы/день</p>
              <p className="text-2xl font-bold">
                {employee.records && employee.records.length > 0 
                  ? (totalHours / employee.records.length).toFixed(1) 
                  : '0.0'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}