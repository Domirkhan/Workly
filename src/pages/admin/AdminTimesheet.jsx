import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Filter, Download, X } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatTime } from '../../utils/formatTime';

export default function AdminTimesheet() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [archiveMonths, setArchiveMonths] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching data for month:', filterMonth); // Добавляем лог
        const [year, month] = filterMonth.split('-');
        const response = await fetch(`/api/timesheet/monthly?month=${month}&year=${year}`);
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных');
        }
        
        const data = await response.json();
        console.log('Received data:', data); // Добавляем лог
        setMonthlyData(data);
        
      // Загружаем архивные месяцы
      const archiveResponse = await fetch('/api/timesheet/archive-months');
      if (archiveResponse.ok) {
        const archiveData = await archiveResponse.json();
        console.log('Archive months:', archiveData); // Добавляем лог
        setArchiveMonths(archiveData);
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

    fetchMonthlyData();
  }, [filterMonth]);

  const fetchEmployeeDetails = async (employeeId) => {
  try {
    setIsLoading(true);
    const [year, month] = filterMonth.split('-');
    
    const response = await fetch(
      `/api/timesheet/employee/${employeeId}/monthly?month=${month}&year=${year}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при загрузке деталей сотрудника');
    }
    
    const data = await response.json();
    setEmployeeDetails(data);
    setShowModal(true);
  } catch (err) {
    console.error('Ошибка загрузки деталей:', err);
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
// Изменим обработчик клика по архивному месяцу
const handleArchiveMonthClick = (month) => {
  try {
    console.log('Clicking archive month:', month);
    // Проверяем формат месяца
    if (!month.match(/^\d{4}-\d{2}$/)) {
      throw new Error('Неверный формат даты');
    }
    
    setIsLoading(true);
    setFilterMonth(month);
    
    // Обновляем UI чтобы показать выбранный месяц
    const button = document.querySelector(`button[data-month="${month}"]`);
    if (button) {
      button.classList.add('bg-blue-50', 'border-blue-500');
    }
  } catch (err) {
    console.error('Ошибка при выборе месяца:', err);
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleDownloadReport = async () => {
    try {
      const doc = new jsPDF();
      
      // Добавляем заголовок
      doc.setFontSize(16);
      doc.text('Табель учета рабочего времени', 15, 15);
      
      // Добавляем информацию о периоде
      doc.setFontSize(12);
      doc.text(`Период: ${format(new Date(filterMonth), 'MMMM yyyy', { locale: ru })}`, 15, 25);
      
      // Готовим данные для таблицы
      const tableData = monthlyData.map(item => [
        item.employee.name,
        item.employee.position,
        item.totalHours.toFixed(1),
        `${item.totalPay.toFixed(2)} тг`
      ]);
      
      // Добавляем таблицу
      autoTable(doc, {
        startY: 35,
        head: [['Сотрудник', 'Должность', 'Часы', 'Сумма']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 12
        }
      });
      
      doc.save(`Табель_${format(new Date(filterMonth), 'MM-yyyy')}.pdf`);
    } catch (error) {
      console.error('Ошибка при создании отчета:', error);
      setError('Ошибка при создании отчета');
    }
  };

  const DetailsModal = () => {
    if (!showModal || !employeeDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              Детали табеля: {employeeDetails.employee?.name}
            </h3>
            <button
              onClick={() => {
                setShowModal(false);
                setEmployeeDetails(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left">Дата</th>
                  <th className="px-4 py-3 text-center">Начало</th>
                  <th className="px-4 py-3 text-center">Конец</th>
                  <th className="px-4 py-3 text-right">Часы</th>
                  <th className="px-4 py-3 text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {employeeDetails.records?.map((record) => (
                  <tr key={record._id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      {format(new Date(record.date), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {format(new Date(record.clockIn), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {record.clockOut ? format(new Date(record.clockOut), 'HH:mm') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                        {record.totalHours ? formatTime(record.totalHours) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {record.calculatedPay?.toFixed(2) || '-'} тг
                    </td>
                  </tr>
                ))}
                {(!employeeDetails.records || employeeDetails.records.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Нет записей за выбранный период
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan="3" className="px-4 py-3 font-medium">Итого:</td>
                  <td className="px-4 py-3 text-right font-medium">
                     {formatTime(employeeDetails.totalHours)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {employeeDetails.totalPay?.toFixed(2) || '0.00'} тг
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
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

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Учет рабочего времени</h1>
          <p className="text-slate-500">Просмотр табелей всех сотрудников</p>
        </div>
        <Button
          variant="primary"
          onClick={handleDownloadReport}
          leftIcon={<Download size={20} />}
        >
          Скачать отчет
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Filter className="mr-2 text-slate-500 w-5 h-5" />
              <span className="text-sm font-medium">Период:</span>
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="form-input flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Сводная таблица за {format(new Date(filterMonth), 'MMMM yyyy', { locale: ru })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Сотрудник</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Должность</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Всего часов</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Сумма</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Действия</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item) => (
                  <tr key={item.employee._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {item.employee.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {item.employee.position}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                      {formatTime(item.totalHours)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                      {item.totalPay.toFixed(2)} тг
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchEmployeeDetails(item.employee._id)}
                      >
                        Детали
                      </Button>
                    </td>
                  </tr>
                ))}
                {monthlyData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Нет данных за выбранный период
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
  <CardHeader>
    <CardTitle>Архив табелей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archiveMonths.map(stats => (
              <Button
                key={stats.month}
                variant="outline"
                className={`w-full flex flex-col items-start p-4 h-auto ${
                  filterMonth === stats.month ? '' : ''
                }`}
                onClick={() => handleArchiveMonthClick(stats.month)}
              >
                <span className="text-lg font-medium">
                  {format(new Date(stats.month + '-01'), 'MMMM yyyy', { locale: ru })}
                </span>
                <div className="mt-2 w-full grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div>
                    <div>Сотрудников: {stats.employeeCount}</div>
                    <div>Часов: {formatTime(stats.totalHours)}</div>
                  </div>
                  <div className="text-right">
                    <div>Ср. часов: {formatTime(stats.avgHoursPerEmployee)}</div>
                    <div>{stats.totalPay.toFixed(0)} тг</div>
                  </div>
                </div>
              </Button>
            ))}
            {archiveMonths.length === 0 && (
              <p className="text-slate-500 col-span-full text-center py-4">
                Нет архивных записей
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <DetailsModal />
    </AdminLayout>
  );
}