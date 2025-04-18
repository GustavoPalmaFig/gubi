import { AuthService } from '@features/auth/services/auth.service';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    router.navigate(['']);
    return false;
  }

  return true;
};
