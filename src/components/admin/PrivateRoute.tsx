import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, authLoading } = useAppContext();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary font-bold animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
