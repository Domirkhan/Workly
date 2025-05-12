import { useState, useEffect } from 'react';
import { QrCode, LogIn, LogOut } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { timesheetApi } from '../../services/api';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { useNavigate } from 'react-router-dom'; // Добавляем для навигации

export default function QRScanner() {
  const navigate = useNavigate(); // Для перенаправления после успешного сканирования
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
        aspectRatio: 1.0 // Добавляем это для лучшего сканирования
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
      console.log('Отсканированный QR-код:', decodedText);
      
      let response;
      if (scanType === 'in') {
        response = await timesheetApi.clockIn({ qrCode: decodedText });
      } else {
        response = await timesheetApi.clockOut({ qrCode: decodedText });
      }
      
      console.log('Ответ сервера:', response);
      
      setIsScanning(false);
      setSuccess(true);
      
      // Перенаправляем на страницу табеля после успешного сканирования
      setTimeout(() => {
        setSuccess(false);
        navigate('/employee/timesheet');
      }, 2000);
      
    } catch (error) {
      setError(error.message);
      console.error('Ошибка при отправке кода:', error);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleError = (error) => {
    console.warn('Ошибка сканирования:', error);
    setError('Ошибка при сканировании. Попробуйте еще раз.');
  };

  const startScanning = (type) => {
    setScanType(type);
    setIsScanning(true);
    setError(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScanType(null);
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
                disabled={isScanning}
              >
                Начать
              </Button>
              
              <Button
                onClick={() => startScanning('out')}
                leftIcon={<LogOut size={18} />}
                variant="secondary"
                disabled={isScanning}
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