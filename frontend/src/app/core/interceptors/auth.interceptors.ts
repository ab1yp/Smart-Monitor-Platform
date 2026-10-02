import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';
import { BehaviorSubject, Observable, throwError, } from 'rxjs';
import { catchError, filter, finalize, switchMap, take, } from 'rxjs/operators';

let refreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  let request = req.clone({ withCredentials: true, });

  if (token) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}`, }, });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!needsRefresh(request, error)) { return throwError(() => error); }
      return refreshAccessToken(request, next, auth, router);
    })
  );
};

function needsRefresh(request: HttpRequest<any>, error: HttpErrorResponse) {
  return (
    error.status === 401 &&
    !request.url.endsWith('/auth/signin') &&
    !request.url.endsWith('/auth/signup') &&
    !request.url.endsWith('/auth/refresh')
  );
}

function refreshAccessToken(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router
): Observable<HttpEvent<any>> {
  if (refreshing) {
    return refreshSubject.pipe(
      filter((token): token is string => token !== null), take(1), switchMap(token => next(addToken(request, token)))
    );
  }
  refreshing = true;
  refreshSubject.next(null);
  return auth.refresh().pipe(
    switchMap(({ accessToken }) => {
      auth.setToken(accessToken);
      refreshSubject.next(accessToken);
      return next(addToken(request, accessToken));
    }),

    catchError(err => {
      auth.clearToken();
      router.navigateByUrl('/al/signin');
      return throwError(() => err);
    }),

    finalize(() => {
      refreshing = false;
    })
  );
}

function addToken(request: HttpRequest<any>, token: string) {
  return request.clone({
    withCredentials: true,
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}