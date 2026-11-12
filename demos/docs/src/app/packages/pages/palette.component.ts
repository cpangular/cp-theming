import { Component, inject, effect, signal } from '@angular/core';
import { TocService } from '../../shell/toc.service';
import { CodeComponent } from '../../shared/code.component';
import palettesScss from '../../../examples/palette/palettes.scss' with { loader: 'text' };
import rolesScss from '../../../examples/palette/roles.scss' with { loader: 'text' };
import brandOnlyScss from '../../../examples/palette/brand-only.scss' with { loader: 'text' };
import primaryOnlyScss from '../../../examples/palette/primary-only.scss' with { loader: 'text' };
import fromBrandScss from '../../../examples/palette/from-brand.scss' with { loader: 'text' };
import derivedOutputCss from '../../../examples/palette/derived.output.css' with { loader: 'text' };

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'Brand, accents and neutrals', anchor: 'chain' },
  { label: 'Runtime derivatives', anchor: 'runtime-derivatives' },
  { label: 'Color variables', anchor: 'color-variables' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'palette()', anchor: 'palette-fn' },
  { label: 'palette-from-brand()', anchor: 'palette-from-brand' },
  { label: 'background-from-brand()', anchor: 'background-from-brand' },
  { label: 'surface-from-brand()', anchor: 'surface-from-brand' },
  { label: 'palette-from-var()', anchor: 'palette-from-var' },
];

@Component({
  selector: 'cpa-palette-page',
  standalone: true,
  imports: [CodeComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Palette</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          A palette is a named color identity defined by one base color. From it the browser derives
          all variant roles at runtime — dark, light, contrast, bg, stroke, tints, and the focus
          ring — using CSS relative color syntax. Nothing is pre-computed at Sass build time.
        </p>
        <p>
          The base color can be written in any CSS color format: <code>oklch()</code>, hex,
          <code>rgb()</code>, <code>hsl()</code>, a named color. <code>oklch</code> is recommended
          for predictable lightness steps: every variant is derived in oklch, so the same step looks
          the same on every hue.
        </p>
        <p>
          Palettes are defined inside <code>t.theme($palettes: (...))</code>. Core palette names —
          <code>brand</code>, <code>primary</code>, <code>secondary</code>, <code>tertiary</code>,
          <code>error</code>, <code>warn</code>, <code>caution</code>, <code>pass</code>,
          <code>surface</code>, <code>background</code> — are pre-registered, and a theme does not
          have to pass all of them. Any additional names in your <code>$palettes</code> map are
          registered on demand.
        </p>
        <cpa-code [code]="ex.palettesScss" lang="scss" />
      </section>

      <section id="chain" class="page-section">
        <h2>Brand, accents and neutrals</h2>
        <p>Pass the colours you have. The others are generated, in the browser, along one chain:</p>
        <p>
          <code>brand</code> → <code>primary</code> → <code>secondary</code>,
          <code>tertiary</code> → <code>background</code>, <code>surface</code>
        </p>
        <p>
          <strong>The brand colour is kept exact.</strong> <code>$brand</code> is the colour from
          your guidelines. It becomes the <code>brand</code> palette, a palette like any other
          (<code>palette="brand"</code>, <code>--color--brand</code>,
          <code>--color--brand--contrast</code>, …), and nothing ever adjusts it. A theme that
          passes a <code>primary</code> and no brand has that primary as its brand palette, exactly
          as passed; one that passes neither inherits the brand of the theme around it.
        </p>
        <p>
          <strong>The primary made from it is adjusted.</strong> A brand colour is often too light,
          too dark or too saturated to carry buttons, links and text. When a theme passes no
          <code>primary</code>, core makes one from the brand: the same hue, with the lightness held
          between 0.35 and 0.45 in light mode and between 0.65 and 0.82 in dark mode, and the chroma
          capped at 0.22. A <code>primary</code> you pass yourself is used exactly as given.
        </p>
        <p>
          <strong>Generated accents stay on their hue.</strong> A screen cannot show every colour at
          every lightness: an orange as dark as the light-mode primary holds less chroma than 0.22,
          and a browser asked for more paints a red. So the generated primary, secondary and
          tertiary give up chroma until the screen can show them, and keep their lightness and hue.
          <code>#ff6a00</code> gets a light-mode primary of <code>#8d3700</code>, an orange-brown. A
          colour the screen can already show is left alone.
        </p>
        <cpa-code [code]="ex.brandOnlyScss" lang="scss" />
        <p>
          <strong>Pass one, two or three accents.</strong> Only <code>primary</code>: secondary and
          tertiary are generated from it. <code>primary</code> and <code>secondary</code>: tertiary
          is generated. All three: none is. Only <code>brand</code>: all of them are.
        </p>
        <cpa-code [code]="ex.primaryOnlyScss" lang="scss" />
        <p>
          <code>error</code>, <code>warn</code>, <code>caution</code> and <code>pass</code> are not
          part of the chain. A theme that leaves one out gets a fixed default (red, orange, amber,
          green), the same ones the presets use.
        </p>
        <p>
          <strong>Nested themes.</strong> A nested theme generates what follows from what it passes
          and inherits the rest. One that passes only <code>primary</code> gets its own secondary
          and tertiary and keeps the background and surface around it; one that passes only
          <code>brand</code> gets the whole chain; one that passes no colour keeps every colour of
          the theme around it. A default theme loaded beside yours (every preset is one) counts as
          the theme around it: on <code>&lt;html&gt;</code> your theme beats it for what you pass
          and what is generated from that, and the rest comes from the default.
        </p>
        <p>
          <strong>Changing a colour by hand.</strong> Each palette colour is a registered pair,
          <code>--color--primary--mode-light</code> and <code>--color--primary--mode-dark</code>.
          Set the pair on <code>:root</code> and everything generated from it follows. On a nested
          <code>[theme]</code> element a hand-written pair changes that palette and its own shades,
          not the palettes generated from it: set those pairs too, or define a theme.
        </p>
      </section>

      <section id="runtime-derivatives" class="page-section">
        <h2>Runtime derivatives</h2>
        <p>
          All variant values are computed by the browser using CSS relative color syntax. A theme
          rule holds only the colors its author passed: for each palette the light and the dark
          color, and the token that joins them with <code>light-dark()</code>. Every derivation is
          declared once, in <code>core.css</code>, as an
          <code>oklch(from var(--color--primary) …)</code> expression that the browser evaluates on
          the element that uses it. These lines are taken from the compiled CSS:
        </p>
        <cpa-code [code]="ex.derivedOutputCss" lang="css" />
        <p>
          The full derivative set for each role (<code>color</code>, <code>bg</code>,
          <code>stroke</code>) includes seven absolute steps: <code>--darkest</code>,
          <code>--darker</code>, <code>--dark</code>, base, <code>--light</code>,
          <code>--lighter</code>, <code>--lightest</code>; seven mode-aware aliases:
          <code>--lowest</code>, <code>--lower</code>, <code>--low</code>, base,
          <code>--high</code>, <code>--higher</code>, <code>--highest</code>; a
          <code>--contrast</code> for each; and <code>--tint-1</code> through <code>--tint-5</code>.
        </p>
        <p>
          <code>--contrast</code> is chosen automatically: white text on a colour whose WCAG
          relative luminance is below 0.179, black text above it. That is the point where both give
          the same contrast, so the text reaches at least 4.5:1 on every opaque colour, in any
          colour format and whatever its hue. Every derived colour is opaque (alpha 1) even when the
          input is not; only the tints carry an alpha.
        </p>
      </section>

      <section id="color-variables" class="page-section">
        <h2>Color variables</h2>
        <p>
          Each palette emits its full set of <code>--color--{{ '{' }}name{{ '}' }}--*</code>
          variables — the actual theme-level custom properties the rest of the system reads. Pick a
          palette to see every variable and the live color it resolves to in the current theme and
          mode.
        </p>
        <div class="pal-toggle">
          @for (p of paletteOptions; track p) {
            <button
              type="button"
              [attr.palette]="p"
              [class.active]="selectedPalette() === p"
              (click)="selectedPalette.set(p)"
            >
              {{ p }}
            </button>
          }
        </div>
        <div class="prop-swatches">
          @for (group of colorGroups; track group.title) {
            <h4 class="swatch-group-title">{{ group.title }}</h4>
            <div class="swatch-grid">
              @for (role of group.roles; track role.suffix) {
                <div
                  class="swatch-chip"
                  [title]="role.desc"
                  [style.background]="'var(--color--' + selectedPalette() + role.suffix + ')'"
                  [style.color]="
                    'var(--color--' + selectedPalette() + role.suffix + '--contrast, currentColor)'
                  "
                >
                  <code>--color--{{ selectedPalette() }}{{ role.suffix }}</code>
                  <span class="swatch-aa">Aa</span>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="palette-fn" class="api-symbol">
          <h3 class="api-symbol-name">palette</h3>
          <p class="api-symbol-desc">
            Define a named palette from a base color in any CSS color format. All derivative roles —
            <code>--dark</code>, <code>--light</code>, <code>--contrast</code>, <code>--bg</code>,
            <code>--tint-N</code>, <code>--focus</code> — are computed by the browser at runtime via
            CSS relative color syntax. Nothing is pre-computed at Sass build time.
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
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$base</span><span class="api-param-type">color</span>
                </div>
                <div class="api-param-desc">
                  Base color, in any CSS color format (<code>oklch(l c h)</code> recommended). All
                  roles are derived from this value. Required.
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
                  <span class="api-param-name">$bg</span><span class="api-param-type">color?</span
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
                  Override for the focus ring color (<code>--color--name--focus</code>). Defaults to
                  a hue-shifted derivative for visibility on same-hue surfaces.
                </div>
              </div>
            </div>
          </div>
          <cpa-code [code]="ex.rolesScss" lang="scss" />
        </div>

        <div id="palette-from-brand" class="api-symbol">
          <h3 class="api-symbol-name">palette-from-brand</h3>
          <p class="api-symbol-desc">
            Derive a palette from the theme's <code>$brand</code> color at runtime using CSS
            relative color. Returns a <code>t.light-dark()</code> pair with lightness clamped to
            appropriate ranges per mode. Requires <code>$brand</code> to be set on
            <code>t.theme()</code>.
          </p>
          <p class="api-symbol-desc">
            A theme that passes <code>$brand</code> and no <code>primary</code> already gets this
            palette as its primary, with the default numbers. Call the function to change the
            numbers, or to make another palette follow the brand:
          </p>
          <cpa-code [code]="ex.fromBrandScss" lang="scss" />
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">palette-from-brand</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$light-l-min</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.35</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$light-l-max</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.5</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$dark-l-min</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.65</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$dark-l-max</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.82</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$c-max</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.22</span
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$light-l-min/max</span
                  ><span class="api-param-type">number</span
                  ><span class="api-param-default">default 0.35 / 0.5</span>
                </div>
                <div class="api-param-desc">Lightness clamp range for light mode.</div>
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
                  Maximum chroma cap. Prevents overly saturated results when the brand color is very
                  vivid. The result has less chroma than this where the screen cannot show it at
                  that lightness, so its hue stays the brand's.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="background-from-brand" class="api-symbol">
          <h3 class="api-symbol-name">background-from-brand</h3>
          <p class="api-symbol-desc">
            Derive a barely-chromatic neutral background palette from the brand color — a
            near-neutral with a whisper of the brand hue, ideal for page backgrounds. Uses a lower
            chroma tint than <code>t.surface-from-brand()</code>. A theme that passes
            <code>$brand</code> and no <code>background</code> gets this palette, with the default
            tint; a grey brand gives a grey background.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span
              ><span class="api-sig-name">background-from-brand</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$c-tint</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.006</span
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="surface-from-brand" class="api-symbol">
          <h3 class="api-symbol-name">surface-from-brand</h3>
          <p class="api-symbol-desc">
            Same as <code>t.background-from-brand()</code> but with slightly higher chroma for card
            and container surfaces. Use <code>background-from-brand()</code> for the page background
            and this for elevated surfaces.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">surface-from-brand</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$c-tint</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.01</span
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$c-tint</span
                  ><span class="api-param-type">number</span
                  ><span class="api-param-default">default 0.01</span>
                </div>
                <div class="api-param-desc">
                  Chroma tint for card/surface backgrounds. Slightly higher than
                  <code>background-from-brand()</code>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="palette-from-var" class="api-symbol">
          <h3 class="api-symbol-name">palette-from-var</h3>
          <p class="api-symbol-desc">
            Like <code>t.palette-from-brand()</code> but reads from an explicit CSS custom property
            name instead of the theme's <code>$brand</code> variable. Useful when you want to derive
            a palette from a CSS variable other than <code>--color--brand</code>.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">palette-from-var</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$var</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$light-l-min</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.35</span
              ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
              ><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$var</span><span class="api-param-type">string</span>
                </div>
                <div class="api-param-desc">
                  CSS custom property name to read from, e.g. <code>'--my-brand-color'</code>.
                  Required.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$light-l-min/max, $dark-l-min/max, $c-max</span
                  ><span class="api-param-type">number</span>
                </div>
                <div class="api-param-desc">
                  Same clamp parameters as <code>palette-from-brand()</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  `,
  styles: [
    `
      @use 'page-shared';

      .pal-toggle {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 24px;
      }

      .pal-toggle button {
        font: inherit;
        font-size: 13px;
        text-transform: capitalize;
        padding: 5px 16px;
        border-radius: 999px;
        border: 1px solid var(--palette-color--stroke, #888);
        background: transparent;
        color: var(--palette-color, currentColor);
        cursor: pointer;
        opacity: 0.6;
        transition:
          opacity 0.15s ease,
          background-color 0.15s ease;
      }

      .pal-toggle button:hover {
        opacity: 1;
        background: var(--palette-color--bg);
      }

      .pal-toggle button.active {
        opacity: 1;
        background: var(--palette-color--bg);
        border-color: var(--palette-color);
        font-weight: 500;
      }

      .prop-swatches {
        display: block;
      }

      .swatch-group-title {
        margin: 22px 0 8px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        opacity: 0.55;
      }

      .swatch-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 8px;
      }

      .swatch-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        min-height: 44px;
        cursor: default;
      }

      .swatch-chip code {
        background: none;
        color: inherit;
        font-size: 11px;
        padding: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .swatch-aa {
        font-weight: 700;
        font-size: 14px;
        opacity: 0.85;
        flex: none;
      }
    `,
  ],
})
export class PalettePageComponent {
  protected readonly ex = {
    palettesScss,
    rolesScss,
    derivedOutputCss,
    brandOnlyScss,
    primaryOnlyScss,
    fromBrandScss,
  };
  readonly paletteOptions = [
    'brand',
    'primary',
    'secondary',
    'tertiary',
    'error',
    'warn',
    'caution',
    'pass',
  ];
  readonly selectedPalette = signal('primary');

  readonly colorGroups = [
    {
      title: 'Identity',
      roles: [{ suffix: '', desc: 'The palette base / identity color.' }],
    },
    {
      title: 'Emphasis (mode-aware)',
      roles: [
        {
          suffix: '--highest',
          desc: 'Top of the 7-step emphasis ladder; direction flips with light/dark mode.',
        },
        { suffix: '--higher', desc: 'Strong emphasis step; flips with mode.' },
        { suffix: '--high', desc: 'Emphasis step toward the foreground.' },
        { suffix: '--low', desc: 'De-emphasis step toward the background.' },
        { suffix: '--lower', desc: 'Strong de-emphasis step; flips with mode.' },
        { suffix: '--lowest', desc: 'Bottom of the 7-step emphasis ladder; flips with mode.' },
      ],
    },
    {
      title: 'Absolute lightness',
      roles: [
        { suffix: '--darkest', desc: 'Three lightness steps darker (mode-independent).' },
        { suffix: '--darker', desc: 'Two lightness steps darker.' },
        { suffix: '--dark', desc: 'One lightness step darker.' },
        { suffix: '--light', desc: 'One lightness step lighter.' },
        { suffix: '--lighter', desc: 'Two lightness steps lighter.' },
        { suffix: '--lightest', desc: 'Three lightness steps lighter.' },
      ],
    },
    {
      title: 'focus & tints',
      roles: [
        {
          suffix: '--focus',
          desc: 'Focus-ring color, hue-shifted for visibility on same-hue surfaces.',
        },
        { suffix: '--tint-1', desc: 'Lightest tint toward surface.' },
        { suffix: '--tint-2', desc: 'Tint step 2.' },
        { suffix: '--tint-3', desc: 'Tint step 3.' },
        { suffix: '--tint-4', desc: 'Tint step 4.' },
        { suffix: '--tint-5', desc: 'Deepest tint step.' },
      ],
    },
    {
      title: 'Background (mode-aware)',
      roles: [
        { suffix: '--bg--highest', desc: 'bg, top of mode-aware scale.' },
        { suffix: '--bg--higher', desc: 'bg, strong emphasis (flips with mode).' },
        { suffix: '--bg--high', desc: 'bg, emphasis toward foreground.' },
        { suffix: '--bg', desc: 'bg base tonal fill.' },
        { suffix: '--bg--low', desc: 'bg, de-emphasis toward background.' },
        { suffix: '--bg--lower', desc: 'bg, strong de-emphasis (flips with mode).' },
        { suffix: '--bg--lowest', desc: 'bg, bottom of mode-aware scale.' },
      ],
    },
    {
      title: 'Background (absolute lightness)',
      roles: [
        { suffix: '--bg--darkest', desc: 'bg, three lightness steps darker.' },
        { suffix: '--bg--darker', desc: 'bg, two lightness steps darker.' },
        { suffix: '--bg--dark', desc: 'bg, one lightness step darker.' },
        { suffix: '--bg', desc: 'bg base tonal fill.' },
        { suffix: '--bg--light', desc: 'bg, one lightness step lighter.' },
        { suffix: '--bg--lighter', desc: 'bg, two lightness steps lighter.' },
        { suffix: '--bg--lightest', desc: 'bg, three lightness steps lighter.' },
      ],
    },
    {
      title: 'Stroke (mode-aware)',
      roles: [
        { suffix: '--stroke--highest', desc: 'stroke, top of mode-aware scale.' },
        { suffix: '--stroke--higher', desc: 'stroke, strong emphasis (flips with mode).' },
        { suffix: '--stroke--high', desc: 'stroke, emphasis toward foreground.' },
        { suffix: '--stroke', desc: 'stroke base border color.' },
        { suffix: '--stroke--low', desc: 'stroke, de-emphasis toward background.' },
        { suffix: '--stroke--lower', desc: 'stroke, strong de-emphasis (flips with mode).' },
        { suffix: '--stroke--lowest', desc: 'stroke, bottom of mode-aware scale.' },
      ],
    },
    {
      title: 'Stroke (absolute lightness)',
      roles: [
        { suffix: '--stroke--darkest', desc: 'stroke, three lightness steps darker.' },
        { suffix: '--stroke--darker', desc: 'stroke, two lightness steps darker.' },
        { suffix: '--stroke--dark', desc: 'stroke, one lightness step darker.' },
        { suffix: '--stroke', desc: 'stroke base border color.' },
        { suffix: '--stroke--light', desc: 'stroke, one lightness step lighter.' },
        { suffix: '--stroke--lighter', desc: 'stroke, two lightness steps lighter.' },
        { suffix: '--stroke--lightest', desc: 'stroke, three lightness steps lighter.' },
      ],
    },
  ];

  constructor() {
    inject(TocService).set(TOC);
  }
}
