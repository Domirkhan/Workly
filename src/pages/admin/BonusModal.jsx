import { useState } from 'react';
import { Dialog } from '../../components/ui/Dialog';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

export default function BonusModal({ isOpen, onClose, employee }) {
  const [formData, setFormData] = useState({
    type: 'bonus',
    amount: '',
    reason: ''
  });

  if (!employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://workly-backend.onrender.com/api/v1/bonuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Добавьте токен
        },
        body: JSON.stringify({
          employeeId: employee._id,
          type: formData.type,
          amount: Number(formData.amount), // Преобразуем в число
          reason: formData.reason
        })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Произошла ошибка');
      }
  
      toast.success(
        formData.type === 'bonus' 
          ? 'Премия успешно начислена' 
          : 'Штраф успешно назначен'
      );
      onClose();
    } catch (error) {
      toast.error(error.message);
      console.error('Ошибка:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {formData.type === 'bonus' ? 'Начисление премии' : 'Назначение штрафа'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Тип</label>
              <select
                className="form-select w-full"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="bonus">Премия</option>
                <option value="penalty">Штраф</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Сумма (тг)</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Причина</label>
              <textarea
                className="form-textarea w-full"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" variant="primary">
                Сохранить
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
}