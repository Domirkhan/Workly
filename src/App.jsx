import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createContext } from 'react';
import { useAuthStore } from './stores/authStore';


// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import EmployeeDashboard from './pages/employee/Dashboard';
import AddEmployee from './pages/admin/AddEmployee';
import AdminEmployeeProfile from './pages/admin/EmployeeProfile';
import EmployeeTimesheet from './pages/employee/Timesheet';
import QRScanner from './pages/employee/QRScanner';
import AdminTimesheet from './pages/admin/AdminTimesheet';
import AdminSettings from './pages/admin/Settings';
import EmployeeProfile from './pages/employee/Profile';
import QRCodeGenerator from './pages/admin/QRCodeGenerator';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import EmployeeList from './pages/admin/EmployeeList';
// Components
import ProtectedRoute from './components/auth/ProtectedRoute';



function App() {
  const { checkAuth } = useAuthStore();


  useEffect(() => {
    checkAuth();
  }, []);

  return (
   
     
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
              <AdminEmployeeProfile />
            </ProtectedRoute>
          } />
          <Route path="/admin/timesheets" element={
            <ProtectedRoute role="admin">
              <AdminTimesheet />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute role="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/qr-generator" element={
            <ProtectedRoute role="admin">
              <QRCodeGenerator />
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
          <Route path="/employee/clock" element={
            <ProtectedRoute role="employee">
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/employee/profile" element={
            <ProtectedRoute role="employee">
              <EmployeeProfile />
            </ProtectedRoute>
          } />

          {/* Редирект с /dashboard на соответствующую панель */}
          <Route path="/dashboard" element={
            <Navigate to={user?.role === 'admin' ? '/admin' : '/employee'} replace />
          } />
          
          {/* 404 страница */}
          <Route path="*" element={<NotFound />} />
        </Routes>
   
    
  );
}

export default App;