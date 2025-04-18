import { AuthService } from '@features/auth/services/auth.service';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  router.navigate(['auth/login']);
  return false;
};
