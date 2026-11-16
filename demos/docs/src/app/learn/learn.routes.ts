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
  {
    path: 'nested',
    loadComponent: () =>
      import('./chapters/06-nested.component').then((m) => m.NestedChapterComponent),
  },
  {
    path: 'contrast',
    loadComponent: () =>
      import('./chapters/07-contrast.component').then((m) => m.ContrastChapterComponent),
  },
  {
    path: 'everything-else',
    loadComponent: () =>
      import('./chapters/08-everything-else.component').then(
        (m) => m.EverythingElseChapterComponent,
      ),
  },
  {
    path: 'runtime',
    loadComponent: () =>
      import('./chapters/09-runtime.component').then((m) => m.RuntimeChapterComponent),
  },
  {
    path: 'material',
    loadComponent: () =>
      import('./chapters/10-material.component').then((m) => m.MaterialChapterComponent),
  },
  {
    path: 'package',
    loadComponent: () =>
      import('./chapters/11-package.component').then((m) => m.PackageChapterComponent),
  },
  { path: '**', redirectTo: '' },
];
