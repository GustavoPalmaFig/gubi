import { authGuard } from '@shared/guards/auth.guard';
import { noAuthGuard } from '@shared/guards/no-auth.guard';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadComponent: () => import('./core/layout/auth/auth.layout').then(m => m.AuthLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/main/main.layout').then(m => m.MainLayout),
    canActivate: [noAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'spaces',
        pathMatch: 'full'
      },
      {
        path: 'spaces',
        loadComponent: () => import('./features/spaces/pages/spaces/spaces.page').then(m => m.SpacesPage)
      },
      {
        path: 'payment-methods',
        loadComponent: () => import('./features/payment-methods/pages/payment-methods-list/payment-methods-list.page').then(m => m.PaymentMethodsListPage)
      }
    ]
  }
];
