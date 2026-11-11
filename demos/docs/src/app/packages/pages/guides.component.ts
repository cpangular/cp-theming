import { Component, computed, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TocService } from '../../shell/toc.service';
import { CodeComponent } from '../../shared/code.component';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import namingDisplayCss from '../../../examples/guides/naming.display.css' with { loader: 'text' };
import derivedOutputCss from '../../../examples/palette/derived.output.css' with { loader: 'text' };
import palettesScss from '../../../examples/palette/palettes.scss' with { loader: 'text' };
import rolesScss from '../../../examples/palette/roles.scss' with { loader: 'text' };
import lightDarkScss from '../../../examples/theme/light-dark.scss' with { loader: 'text' };
import modeHtml from '../../../examples/theme/mode.html' with { loader: 'text' };
import nestedHtml from '../../../examples/theme/nested.html' with { loader: 'text' };
import paletteScopesHtml from '../../../examples/theme/palette-scopes.html' with { loader: 'text' };
import containerVarsDisplayCss from '../../../examples/guides/container-vars.display.css' with {
  loader: 'text',
};
import tonesHtml from '../../../examples/apply-tones/relative.html' with { loader: 'text' };
import elevationHtml from '../../../examples/elevation/levels.html' with { loader: 'text' };
import elevationScss from '../../../examples/elevation/shadow.scss' with { loader: 'text' };
import densityScss from '../../../examples/guides/density.scss' with { loader: 'text' };
import densityHtml from '../../../examples/density/scopes.html' with { loader: 'text' };
import spaceTokensDisplayCss from '../../../examples/guides/space-tokens.display.css' with {
  loader: 'text',
};
import shapeScss from '../../../examples/guides/shape.scss' with { loader: 'text' };
import shapeVarsDisplayCss from '../../../examples/guides/shape-vars.display.css' with {
  loader: 'text',
};
import adaptorScss from '../../../examples/theme/adaptor.scss' with { loader: 'text' };
import ngScopedThemeDisplayHtml from '../../../examples/guides/ng-scoped-theme.display.html' with {
  loader: 'text',
};

const CORE_TOC = [
  { label: 'CSS variable naming', anchor: 'css-naming' },
  { label: 'Runtime derivatives', anchor: 'runtime-derivatives' },
  { label: 'Palettes', anchor: 'palettes' },
  { label: 'Light & dark mode', anchor: 'light-dark' },
  { label: 'Nested theme scopes', anchor: 'nested-scopes' },
  { label: 'Palette scopes & surfaces', anchor: 'surfaces' },
  { label: 'Tone modifiers', anchor: 'tones' },
  { label: 'Elevation', anchor: 'elevation' },
  { label: 'Density', anchor: 'density' },
  { label: 'Shape', anchor: 'shape' },
  { label: 'Adaptor hooks', anchor: 'adaptor-hooks' },
];

const NG_CORE_TOC = [
  { label: 'Signal reactivity', anchor: 'signal-reactivity' },
  { label: 'Scoped themes', anchor: 'scoped-themes' },
  { label: 'Persisting state', anchor: 'persisting-state' },
];

const NG_MATERIAL_TOC = [
  { label: 'How the cascade works', anchor: 'cascade' },
  { label: 'Tertiary palette', anchor: 'tertiary' },
  { label: 'Component overrides', anchor: 'component-overrides' },
];

@Component({
  selector: 'cpa-guides-page',
  standalone: true,
  imports: [CodeComponent, ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Guides</h1>
        <p class="subtitle">{{ lib() }}</p>
      </header>

      @switch (lib()) {
        @case ('core') {
          <section id="css-naming" class="page-section">
            <p>
              <code>--</code> is the namespace separator (like <code>.</code> in OOP).
              <code>-</code> is a word separator within a segment. The <code>color</code> role is
              the palette's primary identity — it becomes the prefix with no trailing segment.
            </p>
            <cpa-code [code]="ex.namingDisplayCss" lang="css" />
          </section>

          <section id="runtime-derivatives" class="page-section">
            <h2>Runtime derivatives</h2>
            <p>
              All variant values are computed by the browser using CSS relative color syntax. A
              theme rule holds only the colors its author passed; every derivation is declared once,
              in <code>core.css</code>, and evaluated on the element that uses it. These lines are
              taken from the compiled CSS:
            </p>
            <cpa-code [code]="ex.derivedOutputCss" lang="css" />
          </section>

          <section id="palettes" class="page-section">
            <h2>Palettes</h2>
            <p>
              Each palette is a named color identity defined by one base color, in any CSS color
              format (<code>oklch</code> is recommended for predictable lightness steps). You can
              provide separate values for light and dark mode with <code>t.light-dark()</code>.
            </p>
            <cpa-code [code]="ex.palettesScss" lang="scss" />
            <p>Override individual roles within a palette:</p>
            <cpa-code [code]="ex.rolesScss" lang="scss" />
            <p>
              Core palette names (<code>primary</code>, <code>secondary</code>, <code>error</code>,
              <code>warn</code>, <code>caution</code>, <code>pass</code>, <code>surface</code>,
              <code>background</code>) are pre-registered. Any additional names in your
              <code>$palettes</code> map are registered on demand.
            </p>
          </section>

          <section id="light-dark" class="page-section">
            <h2>Light &amp; dark mode</h2>
            <p>
              Wrap any sub-config value in <code>t.light-dark($light, $dark)</code> to provide
              separate light and dark values. Each resolves against the mode of the element that
              uses it.
            </p>
            <cpa-code [code]="ex.lightDarkScss" lang="scss" />
            <p>
              The <code>themeMode</code> attribute chooses the mode, on any element, with or without
              a <code>theme</code> attribute:
            </p>
            <cpa-theme-example title="themeMode on any element" [attrsHtml]="ex.modeHtml" />
            <p>Or from TypeScript, for the page as a whole:</p>
            <pre><code class="language-typescript">import &#123; setMode, ThemeMode &#125; from '@cpangular/cp-theming-core';

setMode(ThemeMode.DARK);
setMode(ThemeMode.AUTO);</code></pre>
          </section>

          <section id="nested-scopes" class="page-section">
            <h2>Nested theme scopes</h2>
            <p>
              Place the <code>theme</code> attribute on any element to apply a different theme to
              that subtree. A nested theme declares only what its author passed and inherits
              everything else from the theme around it.
            </p>
            <cpa-theme-example title="A theme inside a theme" [attrsHtml]="ex.nestedHtml" />
          </section>

          <section id="surfaces" class="page-section">
            <h2>Palette scopes &amp; surface attributes</h2>
            <p>
              <code>[palette="name"]</code> activates a palette for a subtree by pointing
              <code>--palette-color--*</code> aliases at the named palette's vars and setting the
              identity text color. Stack atomic surface layers on top:
            </p>
            <cpa-theme-example
              title="Palette scope and surface layers"
              [attrsHtml]="ex.paletteScopesHtml"
            />
            <p>
              <code>filled</code> sets these variables on the element, for content that needs more
              than one text emphasis; a palette scope alone sets <code>--container--stroke</code>:
            </p>
            <cpa-code [code]="ex.containerVarsDisplayCss" lang="css" />
          </section>

          <section id="tones" class="page-section">
            <h2>Tone modifiers</h2>
            <p>Shift the active palette's lightness within a scope:</p>
            <cpa-theme-example title="Mode-relative tone scale" [attrsHtml]="ex.tonesHtml" />
          </section>

          <section id="elevation" class="page-section">
            <h2>Elevation</h2>
            <p>Five shadow levels, adapted for light and dark mode:</p>
            <cpa-theme-example
              title="Shadow levels"
              [attrsHtml]="ex.elevationHtml"
              [scssScss]="ex.elevationScss"
            />
          </section>

          <section id="density" class="page-section">
            <h2>Density</h2>
            <p>
              Set a base density in your theme config, or override per-subtree with
              <code>[themeDensity]</code>:
            </p>
            <cpa-code [code]="ex.densityScss" lang="scss" />
            <cpa-theme-example title="Density scopes" [attrsHtml]="ex.densityHtml" />
            <p>Density tokens:</p>
            <cpa-code [code]="ex.spaceTokensDisplayCss" lang="css" />
          </section>

          <section id="shape" class="page-section">
            <h2>Shape</h2>
            <p>
              A corner radius scale. Pass the steps you want to change; the others keep their
              defaults:
            </p>
            <cpa-code [code]="ex.shapeScss" lang="scss" />
            <p>The variables, with their defaults:</p>
            <cpa-code [code]="ex.shapeVarsDisplayCss" lang="css" />
          </section>

          <section id="adaptor-hooks" class="page-section">
            <h2>Adaptor hooks</h2>
            <p>
              Third-party packages can extend <code>t.define-theme()</code> via the
              <code>$adaptor</code> parameter — without any coupling in core. An adaptor is a Sass
              map of hook mixins returned by a function:
            </p>
            <cpa-code [code]="ex.adaptorScss" lang="scss" />
            <p>
              The map may hold four hook mixins, all optional:
              <code>define-theme-before</code> and <code>define-theme-after</code> (called with the
              theme name, around the theme rule) and <code>define-palette-before</code> and
              <code>define-palette-after</code> (called once per palette name, at root level).
            </p>
          </section>
        }

        @case ('ng-core') {
          <section id="signal-reactivity" class="page-section">
            <h2>ThemeService signal reactivity</h2>
            <p>
              <code>ThemeService</code> uses Angular signals internally. All state changes
              (<code>setTheme</code>, <code>setMode</code>) trigger signal updates synchronously.
              Components that read <code>themeService.theme()</code> or <code>mode()</code>
              re-render automatically when those signals change — no manual subscriptions.
            </p>
          </section>

          <section id="scoped-themes" class="page-section">
            <h2>Scoped themes with ThemeDirective</h2>
            <p>
              Import <code>ThemeDirective</code> and use <code>[theme]</code> on any host element.
              The directive sets the HTML attribute, activating the correct CSS variable scope.
            </p>
            <cpa-code [code]="ex.ngScopedThemeDisplayHtml" lang="html" />
          </section>

          <section id="persisting-state" class="page-section">
            <h2>Persisting theme/mode across sessions</h2>
            <pre><code>// Call once during app startup (e.g. in AppComponent constructor)
const themeService = inject(ThemeService);
themeService.configurePersistence(ThemeStorage.LOCAL);
themeService.restorePersistedState();</code></pre>
          </section>
        }

        @case ('ng-material') {
          <section id="cascade" class="page-section">
            <h2>How the cascade works</h2>
            <p>
              <code>material-core.css</code> declares every <code>--mat-sys-*</code> token as a
              <code>var(--color--*)</code> expression on <code>:root</code> and on every
              <code>[theme]</code> element. A <code>var()</code> is substituted on the element that
              declares the property, not where the property is later used, so a single
              <code>:root</code> rule would hold the root theme's colors and a nested theme would
              not change them. Declaring the tokens again on each <code>[theme]</code> element makes
              that element re-evaluate them against its own theme, and Angular Material components
              inside a <code>[theme="rose-red"]</code> subtree receive rose-red's values. The
              cp-theming color tokens are themselves <code>light-dark()</code> expressions, so a
              nested <code>themeMode</code> flips the Material colors with no rule of its own.
            </p>
          </section>

          <section id="tertiary" class="page-section">
            <h2>Tertiary palette</h2>
            <p>
              Angular Material M3 defines three accent palettes: primary, secondary, and tertiary.
              cp-theming only has two accent palettes. Tertiary is intentionally mapped to
              secondary. If you need a distinct tertiary, override
              <code>--mat-sys-tertiary*</code> after including <code>material-core.css</code>.
            </p>
          </section>

          <section id="component-overrides" class="page-section">
            <h2>Adding component overrides</h2>
            <p>
              A few Angular Material component defaults do not work with cp-theming's roles. Add
              patches in <code>apply-material-overrides()</code> in
              <code>packages/theme-ng-material/scss/_material.scss</code>. The demo-material
              application surfaces these gaps.
            </p>
          </section>
        }

        @default {
          <section class="page-section">
            <p>
              Guides for <strong>{{ lib() }}</strong> are coming soon.
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
export class GuidesPageComponent {
  protected readonly ex = {
    namingDisplayCss,
    derivedOutputCss,
    palettesScss,
    rolesScss,
    lightDarkScss,
    modeHtml,
    nestedHtml,
    paletteScopesHtml,
    containerVarsDisplayCss,
    tonesHtml,
    elevationHtml,
    elevationScss,
    densityScss,
    densityHtml,
    spaceTokensDisplayCss,
    shapeScss,
    shapeVarsDisplayCss,
    adaptorScss,
    ngScopedThemeDisplayHtml,
  };
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
