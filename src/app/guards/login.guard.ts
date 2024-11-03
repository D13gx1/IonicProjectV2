import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica si el usuario está autenticado
  if (await authService.isAuthenticated()) {
    // Si el usuario está autenticado, redirigir a la página de inicio
    return router.parseUrl('/home'); // Redirigir sin dejar entrar a la página de login
  } else {
    // Si el usuario no está autenticado, permitir el acceso a la página de ingreso
    return true;
  }
};
