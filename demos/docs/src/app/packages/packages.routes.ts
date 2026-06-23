import { Routes } from '@angular/router';

export const packagesChildRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview.component').then((m) => m.OverviewPageComponent),
  },
  {
    path: 'getting-started',
    loadComponent: () =>
      import('./pages/getting-started.component').then((m) => m.GettingStartedPageComponent),
  },
  {
    path: 'api',
    loadComponent: () => import('./pages/api.component').then((m) => m.ApiPageComponent),
  },
  {
    path: 'guides',
    loadComponent: () => import('./pages/guides.component').then((m) => m.GuidesPageComponent),
  },
  {
    path: 'showcase',
    loadComponent: () => import('./pages/showcase.component').then((m) => m.ShowcasePageComponent),
  },
];
