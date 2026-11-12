import { Routes } from '@angular/router';

// One route per written chapter; the path is the chapter's `slug` in chapters.ts.
export const learnChildRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./learn-index.component').then((m) => m.LearnIndexComponent),
  },
  {
    path: 'one-colour',
    loadComponent: () =>
      import('./chapters/01-one-colour.component').then((m) => m.OneColourChapterComponent),
  },
  {
    path: 'light-and-dark',
    loadComponent: () =>
      import('./chapters/02-light-and-dark.component').then((m) => m.LightAndDarkChapterComponent),
  },
  {
    path: 'generated',
    loadComponent: () =>
      import('./chapters/03-generated.component').then((m) => m.GeneratedChapterComponent),
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./chapters/04-roles.component').then((m) => m.RolesChapterComponent),
  },
  {
    path: 'scopes',
    loadComponent: () =>
      import('./chapters/05-scopes.component').then((m) => m.ScopesChapterComponent),
  },
  { path: '**', redirectTo: '' },
];
