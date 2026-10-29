import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../interfaces';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const noti = inject(NotificacionService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const apiError: ApiError = (err.error as ApiError) ?? {
        code: 'ERROR_INTERNO',
        detail: err.message || 'Error inesperado.',
      };

      if (err.status === 401 && !req.url.includes('/auth/login')) {
        auth.logout();
        router.navigate(['/login']);
      } else {
        noti.mostrar(apiError.detail || 'Error inesperado.', 'danger');
      }

      return throwError(() => apiError);
    }),
  );
};
