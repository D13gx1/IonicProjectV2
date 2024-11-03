import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const homeGuard: CanActivateFn = async (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.isAuthenticated();
  if (isAuthenticated) {
    return true; // Permite el acceso al home
  } else {
    router.navigate(['/login']); // Redirige a login
    return false; // Deniega el acceso
  }
};
