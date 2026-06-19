// TODO(phase-7): demo-brand-core — example company theme pack
//
// Shows how a company defines and ships their own palette + theme maps
// using @cpangular/cp-theming-core as a peer dependency.
//
// Structure:
//   scss/_brand-palettes.scss   — company brand colors as t.light-dark(t.palette(...))
//   scss/_brand-themes.scss     — full t.theme() definitions using brand palettes
//   scss/brand-midnight.scss    — entry: @include t.define-theme('midnight', $brand-midnight)
//   src/index.ts                — optional TS re-exports of theme names / metadata
//
// A consumer would:
//   @use 'some-brand-package/scss/brand-midnight';
//   — and the theme is available as [theme="midnight"]
