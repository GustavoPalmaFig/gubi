import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { createBrowserRouter } from 'react-router-dom';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPages';
import Home from '../features/home/pages/Home';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [{ element: <AppLayout />, children: [{ index: true, element: <Home /> }] }]
  },
  { path: '*', element: <NotFoundPage /> }
]);
