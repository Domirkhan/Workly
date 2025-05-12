import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import BonusHistory from '../employee/BonusHistory'

export default function Profile() {
  const { user } = useAuthStore();

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
                {user?.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <p className="mt-1 text-lg text-slate-900">
                {user?.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Должность
              </label>
              <p className="mt-1 text-lg text-slate-900">
                {user?.position || 'Не указана'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Ставка (тг/час)
                </label>
                <p className="mt-1 text-lg text-slate-900">
                  {user?.hourlyRate ? `${user.hourlyRate.toFixed(2)}тг` : '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Статус
                </label>
                <p className="mt-1 text-lg text-slate-900">
                  {user?.status === 'active' ? 'Активен' : 'Неактивен'}
                </p>
              </div>
            </div>
            <BonusHistory employeeId={employeeId} />
          </div>
        </CardContent>
      </Card>
    </EmployeeLayout>
  );
}