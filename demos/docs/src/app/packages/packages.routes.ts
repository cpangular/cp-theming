import { Routes } from '@angular/router';

const components = () =>
  import('./pages/components.component').then((m) => m.ComponentsPageComponent);
const showcase = () => import('./pages/showcase.component').then((m) => m.ShowcasePageComponent);

// Explore: the two pages to look around in. They also stay reachable under
// /packages/ng-material, where the browser checks open them.
export const exploreChildRoutes: Routes = [
  { path: '', redirectTo: 'components', pathMatch: 'full' },
  { path: 'components', loadComponent: components },
  { path: 'showcase', loadComponent: showcase },
];

export const packagesChildRoutes: Routes = [
  {
    path: '',
    redirectTo: 'categories',
    pathMatch: 'full',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories.component').then((m) => m.CategoriesPageComponent),
  },
  // kept for ng-core / ng-material which still use the flat page structure
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
    loadComponent: showcase,
  },
  {
    path: 'components',
    loadComponent: components,
  },
  // core module pages
  {
    path: 'palette',
    loadComponent: () => import('./pages/palette.component').then((m) => m.PalettePageComponent),
  },
  {
    path: 'theme',
    loadComponent: () => import('./pages/theme.component').then((m) => m.ThemePageComponent),
  },
  {
    path: 'weights',
    loadComponent: () => import('./pages/weights.component').then((m) => m.WeightsPageComponent),
  },
  {
    path: 'typography',
    loadComponent: () =>
      import('./pages/typography.component').then((m) => m.TypographyPageComponent),
  },
  {
    path: 'density',
    loadComponent: () => import('./pages/density.component').then((m) => m.DensityPageComponent),
  },
  {
    path: 'shape',
    loadComponent: () => import('./pages/shape.component').then((m) => m.ShapePageComponent),
  },
  {
    path: 'focus',
    loadComponent: () => import('./pages/focus.component').then((m) => m.FocusPageComponent),
  },
  {
    path: 'motion',
    loadComponent: () => import('./pages/motion.component').then((m) => m.MotionPageComponent),
  },
  {
    path: 'elevation',
    loadComponent: () =>
      import('./pages/elevation.component').then((m) => m.ElevationPageComponent),
  },
  {
    path: 'overlay',
    loadComponent: () => import('./pages/overlay.component').then((m) => m.OverlayPageComponent),
  },
  {
    path: 'apply',
    redirectTo: 'apply-palette',
    pathMatch: 'full',
  },
  {
    path: 'apply-palette',
    loadComponent: () =>
      import('./pages/apply-palette.component').then((m) => m.ApplyPalettePageComponent),
  },
  {
    path: 'apply-surfaces',
    loadComponent: () =>
      import('./pages/apply-surfaces.component').then((m) => m.ApplySurfacesPageComponent),
  },
  {
    path: 'apply-borders',
    loadComponent: () =>
      import('./pages/apply-borders.component').then((m) => m.ApplyBordersPageComponent),
  },
  {
    path: 'apply-geometry',
    loadComponent: () =>
      import('./pages/apply-geometry.component').then((m) => m.ApplyGeometryPageComponent),
  },
  {
    path: 'apply-tones',
    loadComponent: () =>
      import('./pages/apply-tones.component').then((m) => m.ApplyTonesPageComponent),
  },
  {
    path: 'variables',
    loadComponent: () =>
      import('./pages/variables.component').then((m) => m.VariablesPageComponent),
  },
  {
    path: 'typescript-api',
    loadComponent: () =>
      import('./pages/typescript-api.component').then((m) => m.TypeScriptApiPageComponent),
  },
];
