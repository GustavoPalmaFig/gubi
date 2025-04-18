import { authGuard } from '@shared/guards/auth.guard';
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
  }
];
