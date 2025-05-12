import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Edit, Trash2, Award } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEmployeeStore } from '../../stores/employeeStore';
import { format } from 'date-fns';
import BonusModal from './BonusModal';

export default function EmployeeList() {
  const navigate = useNavigate();
  const { employees, fetchEmployees, deleteEmployee, isLoading, error } = useEmployeeStore();
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p>Загрузка...</p>
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

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      await deleteEmployee(id);
    }
  };

  const openBonusModal = (employee) => {
    setSelectedEmployee(employee);
    setIsBonusModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Сотрудники</h1>
          <p className="text-slate-500">Управление списком сотрудников</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            onClick={() => navigate('/admin/add-employee')}
            leftIcon={<UserPlus size={16} />}
          >
            Добавить сотрудника
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Имя</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Должность</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Ставка</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Статус</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Дата начала</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Действия</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">{employee.name}</td>
                    <td className="px-4 py-3">{employee.email}</td>
                    <td className="px-4 py-3">{employee.position}</td>
                    <td className="px-4 py-3">{employee.hourlyRate}тг/час</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status === 'active' ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {employee.joinDate && !isNaN(new Date(employee.joinDate)) 
                        ? format(new Date(employee.joinDate), 'dd.MM.yyyy') 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBonusModal(employee)}
                        leftIcon={<Award size={16} />}
                      >
                        Премия/Штраф
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/employee/${employee._id}`)}
                        leftIcon={<Edit size={16} />}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee._id)}
                        leftIcon={<Trash2 size={16} />}
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Список сотрудников пуст
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <BonusModal
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        employee={selectedEmployee}
      />
    </AdminLayout>
  );
}