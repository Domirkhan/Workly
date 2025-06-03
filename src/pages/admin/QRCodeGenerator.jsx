import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

export default function QRCodeGenerator() {
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await api.company.generateQRCode();
      setQrData(data.code);
      showToast.success('QR-код успешно сгенерирован');
    } catch (error) {
      console.error('Ошибка:', error);
      setError(error.response?.data?.message || 'Ошибка при генерации QR-кода');
      showToast.error(error.response?.data?.message || 'Ошибка при генерации QR-кода');
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
            {qrData && (
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <QRCodeSVG value={qrData} size={256} />
              </div>
            )}
            
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