import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { createBrowserRouter } from 'react-router-dom';
import { NotFound } from '@/components/layout/NotFound';
import { PaymentMethodPage } from '@/features/payment-methods/pages/PaymentMethodPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { SpacesPage } from '@/features/spaces/pages/SpacesPage';
import Home from '@/features/home/pages/Home';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPages';
import SpaceDetailsPage from '@/features/spaces/pages/SpaceDetailsPage';
import SpaceFormPage from '@/features/spaces/pages/SpaceFormPage';

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
            children: [
              { index: true, element: <Home /> },
              { path: 'spaces', element: <SpacesPage /> },
              { path: 'spaces/new', element: <SpaceFormPage /> },
              { path: 'spaces/:id/edit', element: <SpaceFormPage /> },
              { path: 'spaces/:id', element: <SpaceDetailsPage /> },
              { path: 'payment-methods', element: <PaymentMethodPage /> }
            ]
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
