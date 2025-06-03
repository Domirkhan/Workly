import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';


// Страницы для публичного доступа
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Страницы администратора
import AdminDashboard from './pages/admin/Dashboard';
import EmployeeList from './pages/admin/EmployeeList';
import AddEmployee from './pages/admin/AddEmployee';
import EmployeeProfile from './pages/admin/EmployeeProfile';
import AdminTimesheet from './pages/admin/AdminTimesheet';
import QRCodeGenerator from './pages/admin/QRCodeGenerator';
import Settings from './pages/admin/Settings';

// Страницы сотрудника
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeTimesheet from './pages/employee/Timesheet';
import QRScanner from './pages/employee/QRScanner';
import BonusHistoryPage from './pages/employee/BonusHistoryPage';
import Profile from './pages/employee/Profile';

// Компоненты и хуки
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';

function App() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Ошибка инициализации:', error);
      }
    };

    initAuth();
  }, [checkAuth]);

  return (
    <>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Маршруты администратора */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/employees" element={
          <ProtectedRoute role="admin">
            <EmployeeList />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-employee" element={
          <ProtectedRoute role="admin">
            <AddEmployee />
          </ProtectedRoute>
        } />
        <Route path="/admin/employee/:id" element={
          <ProtectedRoute role="admin">
            <EmployeeProfile />
          </ProtectedRoute>
        } />
        <Route path="/admin/timesheet" element={
          <ProtectedRoute role="admin">
            <AdminTimesheet />
          </ProtectedRoute>
        } />
        <Route path="/admin/qr-code" element={
          <ProtectedRoute role="admin">
            <QRCodeGenerator />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute role="admin">
            <Settings />
          </ProtectedRoute>
        } />

        {/* Маршруты сотрудника */}
        <Route path="/employee" element={
          <ProtectedRoute role="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employee/timesheet" element={
          <ProtectedRoute role="employee">
            <EmployeeTimesheet />
          </ProtectedRoute>
        } />
        <Route path="/employee/scan" element={
          <ProtectedRoute role="employee">
            <QRScanner />
          </ProtectedRoute>
        } />
        <Route path="/employee/bonuses" element={
          <ProtectedRoute role="employee">
            <BonusHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/profile" element={
          <ProtectedRoute role="employee">
            <Profile />
          </ProtectedRoute>
        } />

        {/* Редирект с несуществующих маршрутов */}
        <Route path="*" element={
          <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/employee') : '/'} replace />
        } />
      </Routes>

       <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '12px 24px',
            fontSize: '14px',
            maxWidth: '400px'
          },
          success: {
            style: {
              background: '#10B981',
              color: '#fff'
            }
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff'
            },
            duration: 4000
          }
        }}
      />
    </>
  );
}

export default App;