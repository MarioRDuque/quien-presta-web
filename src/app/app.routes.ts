import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./public/home/home').then(m => m.Home)
    },
    {
        path: 'contactenos',
        loadComponent: () => import('./public/contactenos/contactenos').then(m => m.Contactenos)
    },
    {
        path: 'encontrar',
        loadChildren: () =>
            import('./public/modal/modal.routes').then(m => m.MODAL_ROUTES)
    },
];
