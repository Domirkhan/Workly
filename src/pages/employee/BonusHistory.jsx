import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function BonusHistory({ employeeId }) {
  const [bonuses, setBonuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        const response = await fetch(`/api/bonuses/employee/${employeeId}`);
        const data = await response.json();
        setBonuses(data);
      } catch (error) {
        console.error('Ошибка при загрузке премий/штрафов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBonuses();
  }, [employeeId]);

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>История премий и штрафов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bonuses.map((bonus) => (
            <div 
              key={bonus._id} 
              className={`p-4 rounded-lg border ${
                bonus.type === 'bonus' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {bonus.type === 'bonus' ? 'Премия' : 'Штраф'}: {bonus.amount} тг
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{bonus.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {format(new Date(bonus.date), 'd MMMM yyyy', { locale: ru })}
                  </p>
                  <p className="text-xs text-slate-400">
                    Назначил: {bonus.createdBy.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {bonuses.length === 0 && (
            <p className="text-center text-slate-500 py-4">
              История премий и штрафов пуста
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}