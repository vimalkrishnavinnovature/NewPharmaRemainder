import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/login/login';
import Home from './components/homepage/home';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { AuthUserProvider } from './contexts/authUserContext'; 
import ProtectedRoute from './components/routingProtection/ProtectedRoute';
import UnprotectedRoute from './components/routingProtection/UnProtectedRoute';
const router = createBrowserRouter(
  [
    {
      path: '/',
      element:(
      <UnprotectedRoute>
          <Login />
      </UnprotectedRoute>
      ) 
      
    
    },
    {
      path: '/home',
      element: (
      <ProtectedRoute>
        <Home/>
      </ProtectedRoute>
      )
    }
  ]
);

function App() {
  return (
    <AuthUserProvider> 
      <div className="App">
        <RouterProvider router={router}/>
      </div>
    </AuthUserProvider>
  );
}

export default App;