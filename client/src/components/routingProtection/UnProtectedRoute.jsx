import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authUserContext'; // Import useAuth hook

const UnprotectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); 

  if (isAuthenticated) {
    return <Navigate to="/home" replace />; 
  }

  return children;
};

export default UnprotectedRoute;