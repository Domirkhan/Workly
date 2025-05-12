import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEmployeeStore } from '../../stores/employeeStore';

export default function AddEmployee() {
  const navigate = useNavigate();
  const { addEmployee } = useEmployeeStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    hourlyRate: 2000, // Начальная ставка в тенге
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'hourlyRate') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'ФИО обязательно';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Должность обязательна';
    }
    
    if (formData.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Почасовая ставка должна быть больше 0';
    }
    
    if (!formData.joinDate) {
      newErrors.joinDate = 'Дата начала работы обязательна';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await addEmployee(formData);
      navigate('/admin/employees');
    } catch (error) {
      console.error('Ошибка при добавлении:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    }
  };
  
  const positions = [
    'Разработчик',
    'UX Дизайнер',
    'Проект-менеджер',
    'Маркетолог',
    'HR Менеджер',
    'Менеджер по продажам',
    'Служба поддержки',
    'Финансовый аналитик',
    'Операционный менеджер',
    'Административный помощник'
  ];

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
        <h1 className="text-2xl font-bold text-slate-900">Добавление сотрудника</h1>
        <p className="text-slate-500">Создание профиля нового сотрудника</p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Информация о сотруднике</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="add-employee-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="form-label">
                  ФИО
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="например, Иванов Иван"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="form-label">
                  Email адрес
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="например, ivan@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="position" className="form-label">
                  Должность
                </label>
                <select
                  id="position"
                  name="position"
                  className="form-input"
                  value={formData.position}
                  onChange={handleChange}
                >
                  <option value="">Выберите должность</option>
                  {positions.map(position => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
                {errors.position && <p className="form-error">{errors.position}</p>}
              </div>
              
              <div>
                <label htmlFor="hourlyRate" className="form-label">
                  Почасовая ставка (тг)
                </label>
                <input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="100"
                  className="form-input"
                  placeholder="например, 2000"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                />
                {errors.hourlyRate && <p className="form-error">{errors.hourlyRate}</p>}
              </div>
              
              <div>
                <label htmlFor="status" className="form-label">
                  Статус
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-input"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="joinDate" className="form-label">
                  Дата начала работы
                </label>
                <input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  className="form-input"
                  value={formData.joinDate}
                  onChange={handleChange}
                />
                {errors.joinDate && <p className="form-error">{errors.joinDate}</p>}
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
                {errors.submit}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/employees')}
          >
            Отмена
          </Button>
          <Button 
            type="submit"
            form="add-employee-form"
            leftIcon={<UserPlus size={18} />}
          >
            Добавить сотрудника
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
}