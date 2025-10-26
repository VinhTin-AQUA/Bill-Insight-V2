import { Routes } from '@angular/router';
import { AuthLayout } from './shared/components/layout/auth-layout/auth-layout';
import { MainLayout } from './shared/components/layout/main-layout/main-layout';
import { AddInvoice } from './pages/add-invoice/add-invoice';
import { ListInvoices } from './pages/list-invoices/list-invoices';
import { Settings } from './pages/settings/settings';
import { Config } from './pages/config/config';
import { ConfigDetails } from './pages/config-details/config-details';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
            {
                path: 'invoices',
                component: ListInvoices,
            },
            {
                path: 'config',
                component: Config,
            },
            {
                path: 'config-details',
                component: ConfigDetails,
            },
            {
                path: 'settings',
                component: Settings,
            },
            {
                path: 'add-invoice',
                component: AddInvoice,
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
