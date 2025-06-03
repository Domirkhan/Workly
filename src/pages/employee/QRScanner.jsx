import { useState, useEffect } from 'react';
import { QrCode, LogIn, LogOut } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toast';

export default function QRScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let scanner;
  
    if (isScanning) {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0
      });
  
      scanner.render(handleScan, handleError);
    }
  
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning, scanType]);

  const handleScan = async (decodedText) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Отсканированный QR-код:', decodedText);
      
      const loadingMessage = scanType === 'in' 
        ? 'Начинаем рабочий день...' 
        : 'Завершаем рабочий день...';
      
      const loadingToast = showToast.loading(loadingMessage);

      if (scanType === 'in') {
        await api.timesheet.clockIn({ qrCode: decodedText });
        showToast.success('Рабочий день успешно начат');
      } else {
        await api.timesheet.clockOut({ qrCode: decodedText });
        showToast.success('Рабочий день успешно завершен');
      }
      
      showToast.dismiss(loadingToast);
      setSuccess(true);
      
      // Очищаем сканер
      if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.clear();
      }
      
      // Перенаправляем на табель
      setTimeout(() => {
        setSuccess(false);
        setIsScanning(false);
        setScanType(null);
        navigate('/employee/timesheet');
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка при отправке кода:', error);
      const errorMessage = error.response?.data?.message || 'Произошла ошибка при сканировании';
      setError(errorMessage);
      showToast.error(errorMessage);
      
      // Автоматически скрываем ошибку
      setTimeout(() => {
        setError(null);
        setIsScanning(false);
        setScanType(null);
      }, 3000);
      
      // Очищаем сканер при ошибке
      if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.clear();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error) => {
    console.warn('Ошибка сканирования:', error);
    setError('Ошибка при сканировании. Попробуйте еще раз.');
    showToast.error('Ошибка при сканировании. Проверьте камеру и попробуйте снова.');
  };

  const startScanning = (type) => {
    setScanType(type);
    setIsScanning(true);
    setError(null);
    showToast.dismiss(); // Очищаем предыдущие уведомления
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScanType(null);
    if (window.html5QrcodeScanner) {
      window.html5QrcodeScanner.clear();
    }
  };

  return (
    <EmployeeLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Сканирование QR-кода</h1>
        <p className="text-slate-500">Отметка времени прихода и ухода</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Отметка времени</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
                {scanType === 'in' ? 'Начало рабочего дня отмечено' : 'Конец рабочего дня отмечен'}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => startScanning('in')}
                leftIcon={<LogIn size={18} />}
                variant="primary"
                disabled={isScanning || isLoading}
              >
                Начать
              </Button>
              
              <Button
                onClick={() => startScanning('out')}
                leftIcon={<LogOut size={18} />}
                variant="secondary"
                disabled={isScanning || isLoading}
              >
                Завершить
              </Button>
            </div>

            {isScanning && (
              <div className="mt-4">
                <div className="text-center mb-4">
                  <QrCode className="w-8 h-8 mx-auto text-blue-800 animate-pulse" />
                  <p className="mt-2 text-sm text-slate-600">
                    Отсканируйте QR-код компании
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopScanning}
                    className="mt-2"
                    disabled={isLoading}
                  >
                    Отменить сканирование
                  </Button>
                </div>
                <div 
                  id="reader" 
                  className="mx-auto rounded-lg overflow-hidden"
                  style={{ maxWidth: '500px' }}
                />
              </div>
            )}

            {!isScanning && !success && (
              <p className="text-center text-sm text-slate-500 mt-4">
                Нажмите на соответствующую кнопку для начала или завершения рабочего дня
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </EmployeeLayout>
  );
}