import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'packages/:lib',
    loadComponent: () =>
      import('./packages/packages-layout.component').then((m) => m.PackagesLayoutComponent),
    loadChildren: () => import('./packages/packages.routes').then((m) => m.packagesChildRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
