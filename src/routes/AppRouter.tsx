import { AppLayout } from '@/components/AppLayout';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { createBrowserRouter } from 'react-router-dom';
import { NotFound } from '@/components/layout/NotFound';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import Home from '@/features/home/pages/Home';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPages';

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> }
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [{ index: true, element: <Home /> }]
          }
        ]
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);
