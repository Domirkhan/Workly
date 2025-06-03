import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PlusCircle, MinusCircle } from 'lucide-react';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

export default function BonusHistoryPage() {
  const [bonuses, setBonuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.bonuses.getEmployeeBonuses(user.id);
        setBonuses(data);
        showToast.success('История начислений загружена');
      } catch (error) {
        console.error('Ошибка при загрузке премий/штрафов:', error);
        setError(error.response?.data?.message || 'Ошибка при загрузке данных');
        showToast.error(error.response?.data?.message || 'Ошибка при загрузке данных');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchBonuses();
    }
  }, [user?.id]);
  
  // Вычисляем общую сумму премий и штрафов
  const totals = bonuses.reduce((acc, bonus) => ({
    totalBonus: acc.totalBonus + (bonus.type === 'bonus' ? bonus.amount : 0),
    totalPenalty: acc.totalPenalty + (bonus.type === 'penalty' ? bonus.amount : 0)
  }), { totalBonus: 0, totalPenalty: 0 });

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  if (error) {
    return (
      <EmployeeLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </Button>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900">
            История начислений
          </h1>
          <p className="mt-2 text-slate-500">
            Ваши премии и штрафы
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-green-50 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Всего премий</p>
                <p className="text-2xl font-bold text-green-700">
                  {totals.totalBonus.toLocaleString('ru-RU')} тг
                </p>
              </div>
              <PlusCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6 bg-red-50 border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 mb-1">Всего штрафов</p>
                <p className="text-2xl font-bold text-red-700">
                  {totals.totalPenalty.toLocaleString('ru-RU')} тг
                </p>
              </div>
              <MinusCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Список начислений */}
        <div className="space-y-4">
          {bonuses.map((bonus) => (
            <div
              key={bonus._id}
              className="group hover:shadow-md transition-shadow duration-200 ease-in-out"
            >
              <Card className={`
                p-6 border-l-4 
                ${bonus.type === 'bonus' 
                  ? 'border-l-green-500 hover:bg-green-50' 
                  : 'border-l-red-500 hover:bg-red-50'}
              `}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {bonus.type === 'bonus' ? (
                        <PlusCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <MinusCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        bonus.type === 'bonus' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {bonus.amount.toLocaleString('ru-RU')} тг
                      </span>
                    </div>
                    <p className="text-slate-600">{bonus.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">
                      {format(new Date(bonus.date), 'd MMMM yyyy', { locale: ru })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Назначил: {bonus.createdBy?.name || 'Система'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          
          {bonuses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-900">
                История начислений пуста
              </p>
              <p className="mt-2 text-slate-500">
                У вас пока нет премий и штрафов
              </p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}