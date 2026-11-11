import { Component, computed, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TocService } from '../../shell/toc.service';

const CORE_TOC = [
  { label: 'Mixins', anchor: 'scss-mixins-core' },
  { label: 'Functions — Composition', anchor: 'scss-composition' },
  { label: 'Functions — Palettes', anchor: 'scss-palette' },
  { label: 'Functions — Sub-configs', anchor: 'scss-sub-configs' },
  { label: 'TypeScript API', anchor: 'ts-api' },
];

const NG_CORE_TOC = [
  { label: 'ThemeService', anchor: 'theme-service' },
  { label: '[theme] directive', anchor: 'theme-directive' },
  { label: '[themeMode] directive', anchor: 'thememode-directive' },
];

const NG_MATERIAL_TOC = [
  { label: 'SCSS mixins', anchor: 'scss-mixins' },
  { label: 'adaptor()', anchor: 'adaptor' },
  { label: 'Precompiled CSS', anchor: 'css-exports' },
];

@Component({
  selector: 'cpa-api-page',
  standalone: true,
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>API Reference</h1>
        <p class="subtitle">{{ lib() }}</p>
      </header>

      @switch (lib()) {
        @case ('core') {
          <div class="api-import-line">
            <code>@use '@cpangular/cp-theming-core/scss/theme' as t;</code>
          </div>

          <!-- ── Mixins ─────────────────────────────────────────────────── -->
          <section id="scss-mixins-core" class="page-section">
            <h2 class="api-section-heading">Mixins</h2>
            <hr class="api-section-rule" />

            <div class="api-symbol">
              <h3 class="api-symbol-name">define-core-theme</h3>
              <p class="api-symbol-desc">
                Emit shared <code>&#64;property</code> registrations for all palette color roles,
                and the attribute-selector rules (<code>[theme]</code>, <code>[palette]</code>,
                <code>[themeDensity]</code>) that activate scoped token inheritance. Call once at
                root — never more than once per stylesheet.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">&#64;include t.</span
                  ><span class="api-sig-name">define-core-theme</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$selector</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">':root'</span
                  ><span class="api-sig-punct">)</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$selector</span
                      ><span class="api-param-type">string</span
                      ><span class="api-param-default">default ':root'</span>
                    </div>
                    <div class="api-param-desc">
                      CSS selector to emit <code>&#64;property</code> declarations on. Override only
                      if your app root is not <code>:root</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">define-theme</h3>
              <p class="api-symbol-desc">
                Emit all CSS variable declarations for a named theme scoped to
                <code>[theme="$name"]</code>. Multiple themes can coexist — the active one is
                selected by setting the <code>theme</code> attribute on any ancestor element.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">&#64;include t.</span
                  ><span class="api-sig-name">define-theme</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">$name</span><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$theme</span><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$default</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-default">false</span><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$dedupe</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-default">true</span><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$adaptor</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-default">()</span><span class="api-sig-punct">)</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$name</span
                      ><span class="api-param-type">string</span>
                    </div>
                    <div class="api-param-desc">
                      Attribute value matched by <code>[theme="$name"]</code>. Required.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$theme</span
                      ><span class="api-param-type">map</span>
                    </div>
                    <div class="api-param-desc">
                      Theme config map returned by <code>t.theme()</code>. Required.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$default</span
                      ><span class="api-param-type">boolean</span
                      ><span class="api-param-default">default false</span>
                    </div>
                    <div class="api-param-desc">
                      Also emit on <code>:root</code> so the theme applies without any
                      <code>[theme]</code> attribute present.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$dedupe</span
                      ><span class="api-param-type">boolean</span
                      ><span class="api-param-default">default true</span>
                    </div>
                    <div class="api-param-desc">
                      Skip properties whose light and dark values are identical — reduces output CSS
                      size.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$adaptor</span
                      ><span class="api-param-type">map</span
                      ><span class="api-param-default">default ()</span>
                    </div>
                    <div class="api-param-desc">
                      Hook map from a package adaptor, e.g. <code>mat.adaptor()</code> from
                      <code>cp-theming-ng-material</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Functions — Composition ──────────────────────────────────── -->
          <section id="scss-composition" class="page-section">
            <h2 class="api-section-heading">Functions — Composition</h2>
            <hr class="api-section-rule" />

            <div class="api-symbol">
              <h3 class="api-symbol-name">theme</h3>
              <p class="api-symbol-desc">
                Assemble a theme config map from typed sub-configs. Only <code>$palettes</code>
                is required — all other parameters have well-considered defaults.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">theme</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$palettes</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$brand</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$weights</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$typography</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$palettes</span
                      ><span class="api-param-type">map</span>
                    </div>
                    <div class="api-param-desc">
                      Map of palette name → <code>t.palette()</code> or
                      <code>t.light-dark()</code> pair. Required.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$brand</span
                      ><span class="api-param-type">color?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Brand color emitted as <code>--color--brand</code>. Required for
                      <code>t.palette-from-brand()</code>.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$weights</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      State layer and text blend opacities. Pass <code>t.weights()</code> or
                      <code>t.light-dark(t.weights(), t.weights())</code>.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$typography</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Type scale config from <code>t.typography()</code>. Defaults to system-ui.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$density</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Density scale from <code>t.density()</code>. Defaults to 0 (comfortable).
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$shape</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Corner radius scale from <code>t.shape()</code>.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$focus</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Focus ring width, offset, and style from <code>t.focus()</code>.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$motion</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Motion duration and easing tokens from <code>t.motion()</code>.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$elevation</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Shadow levels from <code>t.elevation()</code>. Dark mode auto-increases shadow
                      opacity.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$overlay</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Scrim and shadow overlay colors from <code>t.overlays()</code>.
                    </div>
                  </div>
                  <h5 class="api-returns-heading">Returns</h5>
                  <div class="api-param-row">
                    <div><span class="api-param-type">map</span></div>
                    <div class="api-param-desc">
                      Theme config map. Pass to <code>t.define-theme()</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">light-dark</h3>
              <p class="api-symbol-desc">
                Wrap any sub-config value to provide separate expressions for light and dark modes.
                The active <code>color-scheme</code> on the root element controls which resolves.
                Not the CSS <code>light-dark()</code> function — works for any value type, not just
                <code>&lt;color&gt;</code>.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">light-dark</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$light</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$dark</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">$light</span
                  ><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$light</span
                      ><span class="api-param-type">any</span>
                    </div>
                    <div class="api-param-desc">
                      Value used in light mode. Can be a palette, sub-config, number, or any type.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$dark</span
                      ><span class="api-param-type">any</span
                      ><span class="api-param-default">default $light</span>
                    </div>
                    <div class="api-param-desc">
                      Value used in dark mode. If omitted, both modes use the same value.
                    </div>
                  </div>
                  <h5 class="api-returns-heading">Returns</h5>
                  <div class="api-param-row">
                    <div><span class="api-param-type">map</span></div>
                    <div class="api-param-desc">
                      A <code>(light: ..., dark: ...)</code> map consumed by <code>t.theme()</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Functions — Palettes ─────────────────────────────────────── -->
          <section id="scss-palette" class="page-section">
            <h2 class="api-section-heading">Functions — Palettes</h2>
            <hr class="api-section-rule" />

            <div class="api-symbol">
              <h3 class="api-symbol-name">palette</h3>
              <p class="api-symbol-desc">
                Define a named palette from a base <code>oklch</code> color. All derivative roles —
                <code>--dark</code>, <code>--light</code>, <code>--contrast</code>,
                <code>--bg</code>, <code>--tint-N</code>, <code>--focus</code> — are computed by the
                browser at runtime via CSS relative color syntax. Nothing is pre-computed at Sass
                build time.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">palette</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$base</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$color</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$bg</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$stroke</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$focus</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$base</span
                      ><span class="api-param-type">oklch color</span>
                    </div>
                    <div class="api-param-desc">
                      Base color in <code>oklch(l c h)</code> format. All roles are derived from
                      this value. Required.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$color</span
                      ><span class="api-param-type">color?</span
                      ><span class="api-param-default">default $base</span>
                    </div>
                    <div class="api-param-desc">
                      Override for the identity role (<code>--color--name</code>).
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$bg</span
                      ><span class="api-param-type">color?</span
                      ><span class="api-param-default">default derived</span>
                    </div>
                    <div class="api-param-desc">
                      Override for the container/bg role (<code>--color--name--bg</code>).
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$stroke</span
                      ><span class="api-param-type">color?</span
                      ><span class="api-param-default">default derived</span>
                    </div>
                    <div class="api-param-desc">
                      Override for the border role (<code>--color--name--stroke</code>).
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$focus</span
                      ><span class="api-param-type">color?</span
                      ><span class="api-param-default">default derived</span>
                    </div>
                    <div class="api-param-desc">
                      Override for the focus ring color (<code>--color--name--focus</code>).
                      Defaults to a hue-shifted derivative for visibility on same-hue surfaces.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">palette-from-brand</h3>
              <p class="api-symbol-desc">
                Derive a palette from the theme's <code>$brand</code> color at runtime using CSS
                relative color. Returns a <code>t.light-dark()</code> pair with lightness clamped to
                appropriate ranges per mode. Requires <code>$brand</code> to be set on
                <code>t.theme()</code>. See also <code>t.palette-from-var($var)</code> for an
                explicit CSS variable name.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span
                  ><span class="api-sig-name">palette-from-brand</span
                  ><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">$light-l-min</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.35</span
                  ><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$light-l-max</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.5</span
                  ><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$dark-l-min</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.65</span
                  ><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$dark-l-max</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.82</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$c-max</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.22</span
                  ><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$light-l-min/max</span
                      ><span class="api-param-type">number</span
                      ><span class="api-param-default">default 0.35 / 0.5</span>
                    </div>
                    <div class="api-param-desc">
                      Lightness clamp range for light mode. Values outside this range are clamped at
                      build time.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$dark-l-min/max</span
                      ><span class="api-param-type">number</span
                      ><span class="api-param-default">default 0.65 / 0.82</span>
                    </div>
                    <div class="api-param-desc">Lightness clamp range for dark mode.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$c-max</span
                      ><span class="api-param-type">number</span
                      ><span class="api-param-default">default 0.22</span>
                    </div>
                    <div class="api-param-desc">
                      Maximum chroma cap. Prevents overly saturated results when the brand color is
                      very vivid.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">background-from-brand</h3>
              <p class="api-symbol-desc">
                Derive a barely-chromatic neutral background palette from the brand color. A
                near-neutral with a whisper of the brand hue — ideal for page backgrounds.
                <code>t.surface-from-brand()</code> uses slightly higher chroma for card surfaces.
                Both have <code>-from-var($var)</code> counterparts for explicit CSS variable names.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span
                  ><span class="api-sig-name">background-from-brand</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$c-tint</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.006</span
                  ><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$c-tint</span
                      ><span class="api-param-type">number</span
                      ><span class="api-param-default">default 0.006</span>
                    </div>
                    <div class="api-param-desc">
                      Chroma tint to apply. <code>0</code> = pure neutral.
                      <code>t.surface-from-brand()</code> defaults to <code>0.01</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Functions — Sub-configs ──────────────────────────────────── -->
          <section id="scss-sub-configs" class="page-section">
            <h2 class="api-section-heading">Functions — Sub-configs</h2>
            <hr class="api-section-rule" />
            <p class="api-symbol-desc">
              All sub-config functions return typed maps consumed by <code>t.theme()</code>. Every
              parameter is optional — omit any key to keep its default. Wrap any sub-config in
              <code>t.light-dark()</code> to provide separate values per mode.
            </p>

            <div class="api-symbol">
              <h3 class="api-symbol-name">weights</h3>
              <p class="api-symbol-desc">
                Configure text opacity levels and state layer opacities for interaction overlays.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">weights</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$text-blend</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.87</span
                  ><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$state-hover</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.08</span
                  ><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$state-press</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0.12</span
                  ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$text-blend</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 0.87</span>
                    </div>
                    <div class="api-param-desc">Primary text opacity.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$text-emphasis-blend</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 1.0</span>
                    </div>
                    <div class="api-param-desc">High-emphasis text opacity.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$text-deemphasis-blend</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 0.55</span>
                    </div>
                    <div class="api-param-desc">Low-emphasis / hint text opacity.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$state-hover</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 0.08</span>
                    </div>
                    <div class="api-param-desc">Hover state layer opacity.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$state-press</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 0.12</span>
                    </div>
                    <div class="api-param-desc">Press / active state layer opacity.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$state-focus</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 0.12</span>
                    </div>
                    <div class="api-param-desc">Keyboard-focused state layer opacity.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$state-drag</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 0.16</span>
                    </div>
                    <div class="api-param-desc">Dragging state layer opacity.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$tints</span
                      ><span class="api-param-type">list?</span
                      ><span class="api-param-default">default (0.04, 0.08, 0.12, 0.18, 0.26)</span>
                    </div>
                    <div class="api-param-desc">
                      Five opacity values for <code>--weight--tint-1</code> through
                      <code>--weight--tint-5</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">typography</h3>
              <p class="api-symbol-desc">
                Configure font families, weights, and optional per-level size overrides.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">typography</span
                  ><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">$plain-family</span
                  ><span class="api-sig-punct">: </span
                  ><span class="api-sig-default">system-ui</span
                  ><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$brand-family</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$plain-family</span
                      ><span class="api-param-type">string?</span
                      ><span class="api-param-default">default system-ui</span>
                    </div>
                    <div class="api-param-desc">Body and UI text font family.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$brand-family</span
                      ><span class="api-param-type">string?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Display / headline font. Falls back to <code>$plain-family</code> if null.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$bold-weight</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 700</span>
                    </div>
                    <div class="api-param-desc">Bold font weight.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$medium-weight</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 500</span>
                    </div>
                    <div class="api-param-desc">Medium / semi-bold font weight.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$regular-weight</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 400</span>
                    </div>
                    <div class="api-param-desc">Regular font weight.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$scale-overrides</span
                      ><span class="api-param-type">map?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Per-level overrides for font-size, line-height, and letter-spacing.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">density</h3>
              <p class="api-symbol-desc">
                <code>0</code> is comfortable (default). Each step reduces component heights and
                spacing down to <code>-5</code> (most compact).
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">density</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$scale</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">0</span
                  ><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$scale</span
                      ><span class="api-param-type">number?</span
                      ><span class="api-param-default">default 0</span>
                    </div>
                    <div class="api-param-desc">
                      Density scale. <code>0</code> = comfortable, <code>-5</code> = most compact.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">shape</h3>
              <p class="api-symbol-desc">
                Configure the corner radius scale. Named steps map to component categories: chips →
                <code>$sm</code>, cards → <code>$md</code>, dialogs → <code>$xl</code>.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">shape</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$xxs</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">2px</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$xs</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">4px</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$sm</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">8px</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$md</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">12px</span
                  ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$xxs / $xs / $sm</span
                      ><span class="api-param-type">length?</span
                      ><span class="api-param-default">2px / 4px / 8px</span>
                    </div>
                    <div class="api-param-desc">
                      Extra-small steps. <code>$sm</code> used for chips and input fields.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$md</span
                      ><span class="api-param-type">length?</span
                      ><span class="api-param-default">12px</span>
                    </div>
                    <div class="api-param-desc">Cards and menus.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$lg</span
                      ><span class="api-param-type">length?</span
                      ><span class="api-param-default">16px</span>
                    </div>
                    <div class="api-param-desc">Side sheets and navigation rail.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$xl / $xxl</span
                      ><span class="api-param-type">length?</span
                      ><span class="api-param-default">28px / 32px</span>
                    </div>
                    <div class="api-param-desc">Dialogs, large surfaces.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$full</span
                      ><span class="api-param-type">length?</span
                      ><span class="api-param-default">9999px</span>
                    </div>
                    <div class="api-param-desc">Fully rounded / pill shape.</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">focus</h3>
              <p class="api-symbol-desc">
                Configure the global focus ring appearance. Ring <em>color</em> is per-palette via
                <code>--color--name--focus</code>.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">focus</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$width</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">2px</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$offset</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">2px</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$style</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">solid</span
                  ><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$width</span
                      ><span class="api-param-type">length?</span
                      ><span class="api-param-default">default 2px</span>
                    </div>
                    <div class="api-param-desc">Focus ring border width.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$offset</span
                      ><span class="api-param-type">length?</span
                      ><span class="api-param-default">default 2px</span>
                    </div>
                    <div class="api-param-desc">Offset from the element edge.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$style</span
                      ><span class="api-param-type">string?</span
                      ><span class="api-param-default">default solid</span>
                    </div>
                    <div class="api-param-desc">CSS border style.</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">motion</h3>
              <p class="api-symbol-desc">
                Configure motion duration and easing tokens emitted as
                <code>--motion--duration-*</code> and <code>--motion--easing-*</code> CSS variables.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">motion</span
                  ><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">$duration-short</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">100ms</span
                  ><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">$duration-medium</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">250ms</span
                  ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$duration-short</span
                      ><span class="api-param-type">time?</span
                      ><span class="api-param-default">default 100ms</span>
                    </div>
                    <div class="api-param-desc">Micro-interactions and toggles.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$duration-medium</span
                      ><span class="api-param-type">time?</span
                      ><span class="api-param-default">default 250ms</span>
                    </div>
                    <div class="api-param-desc">Component transitions.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$duration-long</span
                      ><span class="api-param-type">time?</span
                      ><span class="api-param-default">default 400ms</span>
                    </div>
                    <div class="api-param-desc">Page-level transitions.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$duration-extra</span
                      ><span class="api-param-type">time?</span
                      ><span class="api-param-default">default 600ms</span>
                    </div>
                    <div class="api-param-desc">Complex or emphasized transitions.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$easing-standard</span
                      ><span class="api-param-type">string?</span
                      ><span class="api-param-default">cubic-bezier(0.2,0,0,1)</span>
                    </div>
                    <div class="api-param-desc">Default easing for most transitions.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$easing-emphasized</span
                      ><span class="api-param-type">string?</span
                      ><span class="api-param-default">cubic-bezier(0.2,0,0,1)</span>
                    </div>
                    <div class="api-param-desc">
                      Emphasized motion (shared-axis, container transform).
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$easing-decelerate</span
                      ><span class="api-param-type">string?</span
                      ><span class="api-param-default">cubic-bezier(0,0,0,1)</span>
                    </div>
                    <div class="api-param-desc">Elements entering the screen.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$easing-accelerate</span
                      ><span class="api-param-type">string?</span
                      ><span class="api-param-default">cubic-bezier(0.3,0,1,1)</span>
                    </div>
                    <div class="api-param-desc">Elements leaving the screen.</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">elevation</h3>
              <p class="api-symbol-desc">
                Configure shadow levels for the six elevation steps. Dark mode defaults to 50%
                shadow opacity.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">elevation</span
                  ><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">$shadow-color</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$levels</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$shadow-color</span
                      ><span class="api-param-type">color?</span
                      ><span class="api-param-default">oklch(0 0 0 / 30%)</span>
                    </div>
                    <div class="api-param-desc">
                      Base shadow color. Opacity is scaled per step. Dark mode defaults to 50%.
                    </div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$levels</span
                      ><span class="api-param-type">list?</span
                      ><span class="api-param-default">default null</span>
                    </div>
                    <div class="api-param-desc">
                      Override individual levels as a list of <code>box-shadow</code> values.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">overlays</h3>
              <p class="api-symbol-desc">
                Configure scrim and shadow overlay colors for modal backdrops and elevation.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">t.</span><span class="api-sig-name">overlays</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$scrim</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">$shadow</span
                  ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
                  ><span class="api-sig-punct">) → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$scrim</span
                      ><span class="api-param-type">color?</span
                      ><span class="api-param-default">oklch(0 0 0 / 50%)</span>
                    </div>
                    <div class="api-param-desc">Modal / backdrop scrim color.</div>
                  </div>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$shadow</span
                      ><span class="api-param-type">color?</span
                      ><span class="api-param-default">oklch(0 0 0 / 30%)</span>
                    </div>
                    <div class="api-param-desc">Elevation shadow color.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ── TypeScript API ─────────────────────────────────────────────── -->
          <section id="ts-api" class="page-section">
            <h2 class="api-section-heading">TypeScript API</h2>
            <hr class="api-section-rule" />
            <div class="api-import-line" style="margin-bottom: 28px;">
              <code
                >import &#123; getTheme, setTheme, ThemeMode, ... &#125; from
                '@cpangular/cp-theming-core';</code
              >
            </div>
            <p class="api-symbol-desc">
              All functions accept an optional <code>el?: Element</code> to scope the operation to a
              specific DOM subtree. If omitted they operate on
              <code>document.documentElement</code>.
            </p>

            <div class="api-symbol">
              <h3 class="api-symbol-name">Theme management</h3>
              <h4 class="api-sub-heading">Functions</h4>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">getTheme</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">el</span><span class="api-sig-punct">?: </span
                  ><span class="api-sig-type">Element</span><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">string | null</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Read the active theme name from the nearest <code>[theme]</code> ancestor.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">setTheme</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">name</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-type">string | null</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">el</span
                  ><span class="api-sig-punct">?: </span><span class="api-sig-type">Element</span
                  ><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Apply a theme by name. Pass <code>null</code> to remove and inherit from parent.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">getAvailableThemes</span
                  ><span class="api-sig-punct">(): </span
                  ><span class="api-sig-return">ThemeDef[]</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Scan loaded stylesheets and return all registered theme definitions found via
                    <code>&#64;property</code> registry.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">watchTheme</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">cb</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-type">(name: string | null) =&gt; void</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">opts</span
                  ><span class="api-sig-punct">?: </span
                  ><span class="api-sig-type">WatchOptions</span
                  ><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">() =&gt; void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Subscribe to theme changes. Returns an unsubscribe function.
                  </p>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">Mode management</h3>
              <h4 class="api-sub-heading">Functions</h4>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">getMode</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">el</span><span class="api-sig-punct">?: </span
                  ><span class="api-sig-type">Element</span><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">ThemeMode</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Read the mode setting — <code>AUTO</code>, <code>LIGHT</code>, or
                    <code>DARK</code>.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">setMode</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">mode</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-type">ThemeMode</span><span class="api-sig-punct">, </span
                  ><span class="api-sig-param">el</span><span class="api-sig-punct">?: </span
                  ><span class="api-sig-type">Element</span><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Set light / dark / auto mode by writing <code>color-scheme</code> on the
                    element.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">getEffectiveMode</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">el</span
                  ><span class="api-sig-punct">?: </span><span class="api-sig-type">Element</span
                  ><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">ThemeMode.LIGHT | ThemeMode.DARK</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Resolved mode — never AUTO. Follows system
                    <code>prefers-color-scheme</code> when mode is AUTO.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">getPreferredMode</span
                  ><span class="api-sig-punct">(): </span
                  ><span class="api-sig-return">ThemeMode.LIGHT | ThemeMode.DARK</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Read the OS/browser preferred color scheme via
                    <code>prefers-color-scheme</code> media query.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">watchMode</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">cb</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-type">(mode: ThemeMode) =&gt; void</span
                  ><span class="api-sig-punct">, </span><span class="api-sig-param">opts</span
                  ><span class="api-sig-punct">?: </span
                  ><span class="api-sig-type">WatchOptions</span
                  ><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">() =&gt; void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Subscribe to mode changes. Returns an unsubscribe function.
                  </p>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">Persistence</h3>
              <h4 class="api-sub-heading">Functions</h4>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">configurePersistence</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">storage</span
                  ><span class="api-sig-punct">: </span
                  ><span class="api-sig-type">ThemeStorage</span
                  ><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Wire theme and mode to a storage adapter. Pass <code>localStorage</code>,
                    <code>sessionStorage</code>, or a custom
                    <code>ThemeStorage</code> implementation.
                  </p>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">ThemeMode</h3>
              <p class="api-symbol-desc">Enum representing the three possible mode settings.</p>
              <table class="api-props-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="prop-name">ThemeMode.AUTO</span></td>
                    <td>Follow the system <code>prefers-color-scheme</code> preference.</td>
                  </tr>
                  <tr>
                    <td><span class="prop-name">ThemeMode.LIGHT</span></td>
                    <td>Force light mode regardless of system preference.</td>
                  </tr>
                  <tr>
                    <td><span class="prop-name">ThemeMode.DARK</span></td>
                    <td>Force dark mode regardless of system preference.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        }

        @case ('ng-core') {
          <div class="api-import-line">
            <code
              >import &#123; ThemeService, ThemeMode &#125; from
              '@cpangular/cp-theming-ng-core';</code
            >
          </div>

          <!-- ── Services ───────────────────────────────────────────────────── -->
          <section id="theme-service" class="page-section">
            <h2 class="api-section-heading">Services</h2>
            <hr class="api-section-rule" />

            <div class="api-symbol">
              <h3 class="api-symbol-name">ThemeService</h3>
              <p class="api-symbol-desc">
                Provided in root. Inject via <code>inject(ThemeService)</code>. All state is exposed
                as Angular signals — no subscriptions, no zones, no RxJS needed.
              </p>
              <h4 class="api-sub-heading">Properties</h4>
              <table class="api-props-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span class="prop-name">theme</span
                      ><span class="prop-type">Signal&lt;string | null&gt;</span>
                    </td>
                    <td>Active theme name. <code>null</code> if none is set.</td>
                  </tr>
                  <tr>
                    <td>
                      <span class="prop-name">mode</span
                      ><span class="prop-type">Signal&lt;ThemeMode&gt;</span>
                    </td>
                    <td>Current mode setting — AUTO, LIGHT, or DARK.</td>
                  </tr>
                  <tr>
                    <td>
                      <span class="prop-name">effectiveMode</span
                      ><span class="prop-type">Signal&lt;ThemeMode.LIGHT | ThemeMode.DARK&gt;</span>
                    </td>
                    <td>
                      Resolved mode. When AUTO, follows <code>prefers-color-scheme</code>. Never
                      AUTO.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="prop-name">availableThemes</span
                      ><span class="prop-type">Signal&lt;ThemeDef[]&gt;</span>
                    </td>
                    <td>
                      Themes discovered in loaded stylesheets via
                      <code>&#64;property</code> registry scan.
                    </td>
                  </tr>
                </tbody>
              </table>
              <h4 class="api-sub-heading">Methods</h4>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">setTheme</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">name</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-type">string | null</span
                  ><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Apply a theme by name. Pass <code>null</code> to unset.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">setMode</span><span class="api-sig-punct">(</span
                  ><span class="api-sig-param">mode</span><span class="api-sig-punct">: </span
                  ><span class="api-sig-type">ThemeMode</span><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">Set light / dark / auto mode.</p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">configurePersistence</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">storage</span
                  ><span class="api-sig-punct">: </span
                  ><span class="api-sig-type">ThemeStorage</span
                  ><span class="api-sig-punct">): </span
                  ><span class="api-sig-return">void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Enable automatic save/restore via <code>localStorage</code>,
                    <code>sessionStorage</code>, or a custom adapter.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">restorePersistedState</span
                  ><span class="api-sig-punct">(): </span
                  ><span class="api-sig-return">void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Reapply the previously saved theme and mode on startup. Call in
                    <code>APP_INITIALIZER</code> or <code>ngOnInit</code>.
                  </p>
                </div>
              </div>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-name">refreshAvailableThemes</span
                  ><span class="api-sig-punct">(): </span
                  ><span class="api-sig-return">void</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    Re-scan stylesheets for available themes. Use after lazy-loading a stylesheet
                    that contains additional theme definitions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Directives ──────────────────────────────────────────────────── -->
          <section id="theme-directive" class="page-section">
            <h2 class="api-section-heading">Directives</h2>
            <hr class="api-section-rule" />

            <div class="api-symbol">
              <h3 class="api-symbol-name">ThemeDirective</h3>
              <p class="api-symbol-desc">
                Sets the <code>theme</code> attribute on the host element, scoping all token
                overrides to its subtree. Use to apply different themes to different page regions
                simultaneously.
              </p>
              <p class="api-symbol-selector">Selector: <code>[theme]</code></p>
              <h4 class="api-sub-heading">Properties</h4>
              <table class="api-props-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span class="prop-decorator">&#64;Input()</span
                      ><span class="prop-name">theme: string | null</span>
                    </td>
                    <td>
                      Theme name to activate. <code>null</code> removes the attribute and inherits
                      from the parent scope.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div id="thememode-directive" class="api-symbol">
              <h3 class="api-symbol-name">ThemeModeDirective</h3>
              <p class="api-symbol-desc">
                Sets <code>color-scheme</code> on the host element, overriding light/dark mode for
                its subtree independently of the page-level mode. Useful for forcing dark sidebars
                or light dialog overlays.
              </p>
              <p class="api-symbol-selector">Selector: <code>[themeMode]</code></p>
              <h4 class="api-sub-heading">Properties</h4>
              <table class="api-props-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span class="prop-decorator">&#64;Input()</span
                      ><span class="prop-name">themeMode: ThemeMode | null</span>
                    </td>
                    <td>
                      Mode to apply. <code>null</code> inherits from parent.
                      <code>AUTO</code> follows system preference.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        }

        @case ('ng-material') {
          <div class="api-import-line">
            <code>@use '@cpangular/cp-theming-ng-material/scss/material' as mat;</code>
          </div>

          <!-- ── Mixins ──────────────────────────────────────────────────────── -->
          <section id="scss-mixins" class="page-section">
            <h2 class="api-section-heading">Mixins</h2>
            <hr class="api-section-rule" />

            <div class="api-symbol">
              <h3 class="api-symbol-name">define-ng-material-core-theme</h3>
              <p class="api-symbol-desc">
                Declare every <code>--mat-sys-*</code> token Angular Material reads, on
                <code>:root</code> and on every <code>[theme]</code> element, so a nested theme
                re-evaluates them. The colour roles come from Angular Material's own role tables:
                roles cp-theming has a token for (<code>primary</code>, <code>on-primary</code>,
                <code>surface</code>, <code>on-surface</code>, …) point at it, the other accent
                roles are the theme's colour at the M3 tone the table names, and the surface
                containers, <code>surface-dim</code> and <code>surface-bright</code> are offsets
                from <code>--color--surface</code>. Typography reads <code>--text--*</code>. Also
                emits <code>[palette="name"]</code> rules for the core accent palettes
                (<code>primary</code>, <code>secondary</code>, <code>error</code>,
                <code>warn</code>, <code>caution</code>, <code>pass</code>), so the
                <code>palette</code> attribute recolors the Material components inside it.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">&#64;include mat.</span
                  ><span class="api-sig-name">define-ng-material-core-theme</span
                  ><span class="api-sig-punct">()</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    No parameters. Call once, after <code>t.define-core-theme()</code> and your
                    <code>t.define-theme()</code> calls: the load order is core, themes, adapter.
                  </p>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">material-palette</h3>
              <p class="api-symbol-desc">
                Override the roles Angular Material derives from its primary palette
                (<code>--mat-sys-primary</code>, <code>on-primary</code>, the container pair, the
                fixed roles, <code>inverse-primary</code>, <code>surface-tint</code>) to come from a
                cp-theming named palette, recoloring all Angular Material components inside that CSS
                scope. Scope tightly — the override inherits to all descendants via the normal CSS
                cascade.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">&#64;include mat.</span
                  ><span class="api-sig-name">material-palette</span
                  ><span class="api-sig-punct">(</span><span class="api-sig-param">$name</span
                  ><span class="api-sig-punct">)</span></span
                >
                <div class="api-member-body">
                  <h5 class="api-params-heading">Parameters</h5>
                  <div class="api-param-row">
                    <div>
                      <span class="api-param-name">$name</span
                      ><span class="api-param-type">string</span>
                    </div>
                    <div class="api-param-desc">
                      Palette name to map — e.g. <code>'warn'</code>, <code>'error'</code>,
                      <code>'pass'</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">apply-material-overrides</h3>
              <p class="api-symbol-desc">
                Emit component-level token patches for the cases where a component's own default
                does not work with cp-theming's roles (today: the slide toggle's selected icon and
                the filled form field's container and accent colours). These are targeted fixes, not
                a wholesale M2→M3 shim.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">&#64;include mat.</span
                  ><span class="api-sig-name">apply-material-overrides</span
                  ><span class="api-sig-punct">()</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    No parameters. Call after <code>define-ng-material-core-theme()</code>.
                  </p>
                </div>
              </div>
            </div>

            <div class="api-symbol">
              <h3 class="api-symbol-name">apply-material-density-scopes</h3>
              <p class="api-symbol-desc">
                Emit <code>[themeDensity="-N"]</code> CSS rules that apply Angular Material
                component density size tokens at each scale step.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">&#64;include mat.</span
                  ><span class="api-sig-name">apply-material-density-scopes</span
                  ><span class="api-sig-punct">()</span></span
                >
                <div class="api-member-body"><p class="api-member-desc">No parameters.</p></div>
              </div>
            </div>
          </section>

          <!-- ── Functions ──────────────────────────────────────────────────── -->
          <section id="adaptor" class="page-section">
            <h2 class="api-section-heading">Functions</h2>
            <hr class="api-section-rule" />

            <div class="api-symbol">
              <h3 class="api-symbol-name">adaptor</h3>
              <p class="api-symbol-desc">
                Returns a hooks map for <code>t.define-theme($adaptor: mat.adaptor())</code>. Causes
                every custom palette name defined in your theme to emit a
                <code>[palette="name"] &#123; --mat-sys-primary: ... &#125;</code> override rule —
                so the <code>palette</code> attribute recolors the Material components inside it
                without wrapper classes. The core accent palettes need no adaptor:
                <code>define-ng-material-core-theme()</code> emits their rules.
              </p>
              <p class="api-symbol-desc">
                <code>surface</code> and <code>background</code> get no rule — they are neutral and
                must not remap Material's primary color role.
              </p>
              <div class="api-member-card">
                <span class="api-signature-row"
                  ><span class="api-sig-kw">mat.</span><span class="api-sig-name">adaptor</span
                  ><span class="api-sig-punct">() → </span
                  ><span class="api-sig-return">map</span></span
                >
                <div class="api-member-body">
                  <p class="api-member-desc">
                    No parameters. Returns a hook map for use with <code>t.define-theme()</code>.
                  </p>
                  <h5 class="api-returns-heading">Example</h5>
                  <pre><code>&#64;include t.define-theme('my-app', $config,
  $default: true,
  $adaptor: mat.adaptor(),
);

// In templates — no wrappers needed. "accent" is a custom palette of $config:
// &lt;button mat-flat-button palette="accent"&gt;Share&lt;/button&gt;
// &lt;mat-checkbox palette="accent"&gt;Subscribed&lt;/mat-checkbox&gt;</code></pre>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Precompiled CSS ─────────────────────────────────────────────── -->
          <section id="css-exports" class="page-section">
            <h2 class="api-section-heading">Precompiled CSS exports</h2>
            <hr class="api-section-rule" />
            <p class="api-symbol-desc">
              For projects that cannot author SCSS, precompiled CSS files cover the most common
              configurations. Import in <code>angular.json</code> styles or a global stylesheet.
            </p>
            <table class="api-props-table">
              <thead>
                <tr>
                  <th>Import path</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span class="prop-name"
                      >&#64;cpangular/cp-theming-ng-material/css/material-core</span
                    >
                  </td>
                  <td>
                    All 166 <code>--mat-sys-*</code> → <code>var(--color--*)</code> token mappings.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="prop-name"
                      >&#64;cpangular/cp-theming-ng-material/css/material-overrides</span
                    >
                  </td>
                  <td>
                    Component-level token patches plus density scope rules. Apply after
                    <code>material-core</code>.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="prop-name">&#64;cpangular/cp-theming-ng-material/scss/*</span>
                  </td>
                  <td>Full SCSS source including <code>adaptor()</code>.</td>
                </tr>
              </tbody>
            </table>
          </section>
        }

        @default {
          <section class="page-section">
            <p>
              API reference for <strong>{{ lib() }}</strong> is coming soon.
            </p>
          </section>
        }
      }
    </article>
  `,
  styles: [
    `
      @use 'page-shared';
    `,
  ],
})
export class ApiPageComponent {
  private readonly _toc = inject(TocService);
  private readonly _parentParams = toSignal(inject(ActivatedRoute).parent!.params);
  readonly lib = computed(() => (this._parentParams()?.['lib'] as string) ?? 'core');

  constructor() {
    effect(() => {
      const lib = this.lib();
      if (lib === 'core') this._toc.set(CORE_TOC);
      else if (lib === 'ng-core') this._toc.set(NG_CORE_TOC);
      else if (lib === 'ng-material') this._toc.set(NG_MATERIAL_TOC);
      else this._toc.clear();
    });
  }
}
