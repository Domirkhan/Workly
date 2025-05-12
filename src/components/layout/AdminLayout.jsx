import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, ClipboardList, BarChart3, Settings, LogOut, Menu, X, QrCode } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuthStore } from '../../stores/authStore';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navigationItems = [
    { name: 'Главная', path: '/admin', icon: <BarChart3 size={20} /> },
    { name: 'Сотрудники', path: '/admin/employees', icon: <Users size={20} /> },
    { name: 'QR-код', path: '/admin/qr-generator', icon: <QrCode size={20} /> }, // Добавляем этот пункт
    { name: 'Табели', path: '/admin/timesheets', icon: <ClipboardList size={20} /> },
    { name: 'Настройки', path: '/admin/settings', icon: <Settings size={20} /> },
  ];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Мобильная шапка */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
        <Logo />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Мобильное боковое меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-3 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Выйти
            </button>
          </nav>
        </div>
      )}
      
      {/* Десктопное боковое меню */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-slate-200">
          <div className="px-6 pb-4">
            <Logo />
          </div>
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="px-4 pb-4">
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center px-4 py-2">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-2 w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Выйти
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Основной контент */}
      <main className="flex-1 md:pl-64">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}