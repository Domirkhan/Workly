import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Clock, DollarSign, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  // Получаем данные сотрудника из БД
  useEffect(() => {
async function fetchEmployee() {
  try {
    const response = await fetch(
      `https://workly-backend.onrender.com/api/v1/employees/${id}`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error('Не удалось загрузить данные сотрудника');
    }
    
    const data = await response.json();
    setEmployee(data);
    setFormData(data);
  } catch (error) {
    console.error('Ошибка загрузки данных сотрудника:', error);
    setError(error.message);
  }
}
    fetchEmployee();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hourlyRate' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Сохраняет изменения сотрудника в БД
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        throw new Error('Update failed');
      }
      const updatedEmployee = await res.json();
      setEmployee(updatedEmployee);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };
  
  // Удаление сотрудника
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      try {
        const res = await fetch(`/api/v1/employees/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          throw new Error('Delete failed');
        }
        navigate('/admin/employees');
      } catch (error) {
        console.error(error);
      }
    }
  };
  
  if (!employee) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p>Loading employee data...</p>
        </div>
      </AdminLayout>
    );
  }
  
  // Для примера расчитаем статистику, если у сотрудника есть записи (в вашем API их можно получить отдельно)
  const totalHours = employee.records ? employee.records.reduce((sum, rec) => sum + (rec.totalHours || 0), 0) : 0;
  const totalEarnings = employee.records ? employee.records.reduce((sum, rec) => sum + (rec.calculatedPay || 0), 0) : 0;
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/employees')}
          className="flex items-center text-slate-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Employees
        </button>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employee Profile</h1>
            <p className="text-slate-500">{employee.name}</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Edit size={16} />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={formData.name || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="position" className="form-label">Position</label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  className="form-input"
                  value={formData.position || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="hourlyRate" className="form-label">Hourly Rate</label>
                <input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={formData.hourlyRate || 0}тг
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  id="status"
                  name="status"
                  className="form-input"
                  value={formData.status || 'active'}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="joinDate" className="form-label">Join Date</label>
                <input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  className="form-input"
                  value={formData.joinDate ? formData.joinDate.split('T')[0] : ''}
                  onChange={handleChange}
                />
              </div>
              
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center py-2 border-b border-slate-100">
                <User className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="font-medium">{employee.name}</p>
                </div>
              </div>
              <div className="flex items-center py-2 border-b border-slate-100">
                <Mail className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center py-2 border-b border-slate-100">
                <User className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs text-slate-500">Position</p>
                  <p className="font-medium">{employee.position || 'Not Specified'}</p>
                </div>
              </div>
              <div className="flex items-center py-2 border-b border-slate-100">
                <DollarSign className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs text-slate-500">Hourly Rate</p>
                  <p className="font-medium">{employee.hourlyRate.toFixed(2)}тг</p>
                </div>
              </div>
              <div className="flex items-center py-2 border-b border-slate-100">
                <Clock className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              <div className="flex items-center py-2 border-b border-slate-100">
                <Calendar className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs text-slate-500">Join Date</p>
                  <p className="font-medium">
                    {format(new Date(employee.joinDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit" form="edit-employee-form">Save Changes</Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Дополнительная статистика (при наличии записей) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 mb-2">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Total Earnings</p>
              <p className="text-2xl font-bold">{totalEarnings.toFixed(2)}тг</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Avg Hours/Day</p>
              <p className="text-2xl font-bold">
                {employee.records && employee.records.length > 0 
                  ? (totalHours / employee.records.length).toFixed(1) 
                  : '0.0'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}