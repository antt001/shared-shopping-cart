import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Adapt based on your implementation

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect them to the login page, but save the current location they were trying to go to
    navigate('/login', { replace: true, state: { from: location }});
  }

  if (role && !allowedRoles.includes(role)) {
    // Redirect them to the login page, but save the current location they were trying to go to
    navigate('/dashboard', { replace: true, state: { from: location }});
  }
  
  return <Outlet />; // Render children routes if there are any
};

export default ProtectedRoute;
