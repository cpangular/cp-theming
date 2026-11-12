import { Routes } from '@angular/router';

const layout = () =>
  import('./packages/packages-layout.component').then((m) => m.PackagesLayoutComponent);

// Three tracks (PORT-PLAN.md, Phase 17), all in the same layout:
//   /learn            chapters read in order
//   /packages/:lib    the Reference, one section per package
//   /explore          the Components gallery and the Showcase
// `lib` reaches the layout as an input: the route parameter, or the route's data.
export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'learn',
    loadComponent: layout,
    data: { lib: 'learn' },
    loadChildren: () => import('./learn/learn.routes').then((m) => m.learnChildRoutes),
  },
  {
    path: 'explore',
    loadComponent: layout,
    data: { lib: 'explore' },
    loadChildren: () => import('./packages/packages.routes').then((m) => m.exploreChildRoutes),
  },
  {
    path: 'packages/:lib',
    loadComponent: layout,
    loadChildren: () => import('./packages/packages.routes').then((m) => m.packagesChildRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
