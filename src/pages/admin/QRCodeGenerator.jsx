import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AdminLayout from '../../components/layout/AdminLayout';

export default function QRCodeGenerator() {
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://workly-backend.onrender.com/api/v1/company/qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации QR-кода');
      }

      const data = await response.json();
      
      if (!data.code) {
        throw new Error('Некорректный ответ от сервера');
      }

      setQrData(data.code);
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message || 'Ошибка при генерации QR-кода');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">QR-код компании</h1>
        <p className="text-slate-500">Сгенерируйте QR-код для отметки времени сотрудников</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {qrData ? (
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <QRCodeSVG value={qrData} size={256} />
              </div>
            ) : null}
            
            <Button
              onClick={generateQRCode}
              isLoading={isLoading}
              leftIcon={<QrCode size={20} />}
              disabled={isLoading}
            >
              {qrData ? 'Сгенерировать новый код' : 'Сгенерировать QR-код'}
            </Button>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            {qrData && (
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">
                  Разместите этот QR-код в месте, где сотрудники могут легко его отсканировать
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                >
                  Распечатать QR-код
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}