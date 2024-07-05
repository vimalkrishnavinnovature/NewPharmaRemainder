import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authUserContext'; // Import useAuth hook

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Use useAuth to check if the user is authenticated

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;