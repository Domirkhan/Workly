import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading  } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });
  
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Добавляем функцию handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибки при изменении поля
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await register(formData);
      navigate(formData.role === 'admin' ? '/admin' : '/employee');
    } catch (error) {
      setError(error.message);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 p-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Создать аккаунт
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-blue-800 hover:text-blue-700">
            Войти
          </Link>
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="scale-in">
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="role" className="form-label">
                    Я являюсь
                  </label>
                  <select 
                    id="role"
                    name="role"
                    className="form-input"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="admin">Руководителем компании</option>
                    <option value="employee">Сотрудником</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="form-label">
                    Полное имя
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Иван Иванов"
                  />
                  {formErrors.name && (
                    <p className="form-error">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && (
                    <p className="form-error">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Пароль
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  {formErrors.password && (
                    <p className="form-error">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Подтвердите пароль
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  {formErrors.confirmPassword && (
                    <p className="form-error">{formErrors.confirmPassword}</p>
                  )}
                </div>

                {formData.role === 'admin' ? (
                  <div>
                    <label htmlFor="companyName" className="form-label">
                      Название компании
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      className="form-input"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="ООО 'Компания'"
                    />
                    {formErrors.companyName && (
                      <p className="form-error">{formErrors.companyName}</p>
                    )}
                  </div>
                ): null}

                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isLoading}
                  leftIcon={<UserPlus size={18} />}
                >
                  {isLoading ? 'Создание...' : 'Создать аккаунт'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}