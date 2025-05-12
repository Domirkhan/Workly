import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function Settings() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Настройки</h1>
        <p className="text-slate-500">Управление настройками компании</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Здесь будут настройки */}
          <p className="text-slate-500">Раздел в разработке</p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}