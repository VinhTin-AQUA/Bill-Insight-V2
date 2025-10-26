import { Routes } from '@angular/router';
import { AuthLayout } from './shared/components/layout/auth-layout/auth-layout';
import { MainLayout } from './shared/components/layout/main-layout/main-layout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
            {
                path: 'settings',
                loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
            },
            { path: '', redirectTo: 'home', pathMatch: 'full' },
        ],
    },
    {
        path: '',
        component: AuthLayout,
        children: [
            {
                path: 'config',
                loadComponent: () => import('./pages/config/config').then((m) => m.Config),
            },
            { path: '', redirectTo: 'config', pathMatch: 'full' },
        ],
    },

    { path: '**', redirectTo: '' },
];
