import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../constants/toastMessages';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { user } = await api.auth.login(formData);
      
      // Редирект в зависимости от роли
      navigate(user.role === 'admin' ? '/admin' : '/employee');
      
      toast.success(TOAST_MESSAGES.SUCCESS.LOGIN);
    } catch (error) {
      console.error('Ошибка входа:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 p-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Вход в аккаунт
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-blue-800 hover:text-blue-700">
            Зарегистрироваться
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="scale-in">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="form-label">
                    Пароль
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isLoading}
                  leftIcon={<LogIn size={18} />}
                >
                  {isLoading ? 'Вход...' : 'Войти'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}