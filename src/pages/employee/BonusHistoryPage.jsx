import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';

export default function BonusHistoryPage() {
  const [bonuses, setBonuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        const response = await fetch(`/api/v1/bonuses/employee/${user.id}`);
        const data = await response.json();
        setBonuses(data);
      } catch (error) {
        console.error('Ошибка при загрузке премий/штрафов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchBonuses();
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-pulse">
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  // Вычисляем общую сумму премий и штрафов
  const totals = bonuses.reduce((acc, bonus) => {
    if (bonus.type === 'bonus') {
      acc.totalBonus += bonus.amount;
    } else {
      acc.totalPenalty += bonus.amount;
    }
    return acc;
  }, { totalBonus: 0, totalPenalty: 0 });

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
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-green-50 border-green-100">
            <p className="text-sm text-green-600 mb-1">Всего премий</p>
            <p className="text-2xl font-bold text-green-700">
              {totals.totalBonus.toLocaleString('ru-RU')} тг
            </p>
          </Card>
          <Card className="p-6 bg-red-50 border-red-100">
            <p className="text-sm text-red-600 mb-1">Всего штрафов</p>
            <p className="text-2xl font-bold text-red-700">
              {totals.totalPenalty.toLocaleString('ru-RU')} тг
            </p>
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
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                        </svg>
                      )}
                      <span className={`font-medium ${bonus.type === 'bonus' ? 'text-green-700' : 'text-red-700'}`}>
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
                      {bonus.createdBy.name}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          
          {bonuses.length === 0 && (
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-12 w-12 text-slate-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <p className="mt-4 text-slate-500">
                История начислений пуста
              </p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}