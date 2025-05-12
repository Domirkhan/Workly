import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function ProtectedRoute({ children, role }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <p>Loading...</p>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return children;
}