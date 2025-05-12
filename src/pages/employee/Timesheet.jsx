import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Filter, Download } from 'lucide-react';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '@fontsource/roboto/cyrillic.css';

export default function EmployeeTimesheet() {
  const { user } = useAuthStore();
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [archiveMonths, setArchiveMonths] = useState([]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      try {
        const [year, month] = filterMonth.split('-');
        // Получаем данные за выбранный месяц
        const response = await fetch(`/api/timesheet/employee/monthly?month=${month}&year=${year}`);
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных');
        }
        
        const data = await response.json();
        console.log('Получены данные за месяц:', data); // Добавляем лог
        setMonthlyData(data);
  
        // Загружаем список доступных месяцев для архива
        const archiveResponse = await fetch('/api/timesheet/employee/archive-months');
        if (!archiveResponse.ok) {
          throw new Error('Ошибка при загрузке архива');
        }
        
        const archiveData = await archiveResponse.json();
        console.log('Получены архивные месяцы:', archiveData); // Добавляем лог
        setArchiveMonths(archiveData);
        
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchMonthlyData();
  }, [filterMonth]);

  const handleDownloadReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Табель учета рабочего времени', 15, 15);
      
      doc.setFontSize(12);
      doc.text(`Сотрудник: ${user?.name}`, 15, 25);
      doc.text(`Должность: ${user?.position}`, 15, 32);
      doc.text(`Период: ${format(new Date(filterMonth), 'MMMM yyyy', { locale: ru })}`, 15, 39);
      
      if (monthlyData) {
        doc.text(`Всего часов: ${monthlyData.summary.totalHours.toFixed(1)}`, 15, 46);
        doc.text(`Заработано: ${monthlyData.summary.totalPay.toFixed(2)} тг`, 15, 53);
        doc.text(`Рабочих дней: ${monthlyData.summary.workDays}`, 15, 60);

        // Подготавливаем данные для таблицы
        const tableData = monthlyData.records.map(record => [
          format(new Date(record.date), 'dd.MM.yyyy'),
          format(new Date(record.clockIn), 'HH:mm'),
          record.clockOut ? format(new Date(record.clockOut), 'HH:mm') : '-',
          record.totalHours?.toFixed(1) || '-',
          `${record.calculatedPay?.toFixed(2) || '-'} тг`
        ]);

        autoTable(doc, {
          startY: 70,
          head: [['Дата', 'Начало', 'Конец', 'Часы', 'Сумма']],
          body: tableData,
          theme: 'grid',
          styles: { font: 'helvetica', fontSize: 10 },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          }
        });
      }

      doc.save(`Табель_${user?.name}_${filterMonth}.pdf`);
    } catch (error) {
      console.error('Ошибка при создании отчета:', error);
      setError('Ошибка при создании отчета');
    }
  };

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="flex justify-center items-center h-96">
          <p>Загрузка данных...</p>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Мой табель</h1>
          <p className="text-slate-500">Учет рабочего времени</p>
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

      {/* Статистика за месяц */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500">Рабочих дней</p>
              <p className="text-3xl font-bold mt-2">{monthlyData?.summary?.workDays || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500">Всего часов</p>
              <p className="text-3xl font-bold mt-2">
                {monthlyData?.summary?.totalHours?.toFixed(1) || '0.0'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500">Заработано</p>
              <p className="text-3xl font-bold mt-2">
                {monthlyData?.summary?.totalPay?.toFixed(2) || '0.00'} тг
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальная таблица */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Детальный отчет за {format(new Date(filterMonth), 'MMMM yyyy', { locale: ru })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Дата</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Начало</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Конец</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Часы</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData?.records?.map((record) => (
                  <tr key={record._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(record.date), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {format(new Date(record.clockIn), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {record.clockOut ? format(new Date(record.clockOut), 'HH:mm') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {record.totalHours?.toFixed(1) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {record.calculatedPay?.toFixed(2) || '-'} тг
                    </td>
                  </tr>
                ))}
                {(!monthlyData?.records || monthlyData.records.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Нет записей за выбранный период
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Архив табелей */}
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
                      filterMonth === stats.month ? 'bg-blue-50 border-blue-500' : ''
                    }`}
                    onClick={() => setFilterMonth(stats.month)}
                  >
                    <span className="text-lg font-medium">
                      {format(new Date(stats.month + '-01'), 'MMMM yyyy', { locale: ru })}
                    </span>
                    <div className="mt-2 w-full grid grid-cols-2 gap-2 text-sm text-slate-600">
                      <div>
                        <div>Дней: {stats.daysWorked}</div>
                        <div>Часов: {stats.totalHours.toFixed(1)}</div>
                      </div>
                      <div className="text-right">
                        <div>Ср. часов: {stats.avgHoursPerDay}</div>
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
    </EmployeeLayout>
  );
}