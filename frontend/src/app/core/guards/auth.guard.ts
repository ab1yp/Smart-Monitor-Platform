import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot, UrlTree, } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../features/auth/services/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.getToken()) { return true; }
  return authService.refresh().pipe(
    map((response: any) => {
      console.log('Refresh response:', response);
      const accessToken = response?.accessToken;
      if (!accessToken) {
        return router.createUrlTree(
          ['/al/signin'],
          { queryParams: { returnUrl: state.url } }
        );
      }
      authService.setToken(accessToken);
      return true;
    }),
    catchError((error) => {
      console.error('Auth Guard refresh failed:', error);
      return of(
        router.createUrlTree(
          ['/al/signin'],
          { queryParams: { returnUrl: state.url } }
        )
      );
    })
  );
};