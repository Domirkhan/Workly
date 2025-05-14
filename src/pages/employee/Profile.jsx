import { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { formatTime } from '../../utils/formatTime';


export default function Profile() {
  const { user } = useAuthStore();

  // Проверяем наличие user и user.id
  if (!user || !user.id) {
    return (
      <EmployeeLayout>
        <div className="flex justify-center items-center h-96">
          <p>Загрузка данных профиля...</p>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Мой профиль</h1>
        <p className="text-slate-500">
          Просмотрите и обновите свою личную информацию
        </p>
      </div>
      
      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Личная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Имя
              </label>
              <p className="mt-1 text-lg text-slate-900">
                {user.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <p className="mt-1 text-lg text-slate-900">
                {user.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Должность
              </label>
              <p className="mt-1 text-lg text-slate-900">
                {user.position || 'Не указана'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Ставка (тг/час)
                </label>
                <p className="mt-1 text-lg text-slate-900">
                  {user.hourlyRate ? `${user.hourlyRate.toFixed(2)}тг` : '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Статус
                </label>
                <p className="mt-1 text-lg text-slate-900">
                  {user.status === 'active' ? 'Активен' : 'Неактивен'}
                </p>
              </div>
            </div>
            {/* Передаем ID пользователя в компонент BonusHistory */}
            <div className="mt-6">
              <Link 
                to="/bonus-history"
                className="text-blue-600 hover:text-blue-700 flex items-center justify-center"
              >
                <span>Посмотреть полную историю премий и штрафов</span>
                <svg 
                  className="w-4 h-4 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </EmployeeLayout>
  );
}