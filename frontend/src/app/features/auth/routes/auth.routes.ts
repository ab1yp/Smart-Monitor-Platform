import { Routes } from '@angular/router';
export const AuthRoutes: Routes = [
    { path: "signup", loadComponent: () => import('../components/sign-up/sign-up').then(x => x.SignUp) },
    { path: "signin", loadComponent: () => import('../components/sign-in/sign-in').then(x => x.SignIn) },
    { path: "", loadComponent: () => import('../components/sign-in/sign-in').then(x => x.SignIn) },
    { path: "updatepassword", loadComponent: () => import('../components/update-pass/update-pass').then(x => x.UpdatePass) },
]
