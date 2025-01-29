import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('users').then(m => m.usersRoutes)
    },
    {
        path: "**",
        redirectTo: "auth/login"
    }
];