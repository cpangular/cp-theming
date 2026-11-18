import { Component, inject, effect, signal } from '@angular/core';
import { TocService } from '../../shell/toc.service';
import { CodeComponent } from '../../shared/code.component';
import palettesScss from '../../../examples/palette/palettes.scss' with { loader: 'text' };
import rolesScss from '../../../examples/palette/roles.scss' with { loader: 'text' };
import brandOnlyScss from '../../../examples/palette/brand-only.scss' with { loader: 'text' };
import primaryOnlyScss from '../../../examples/palette/primary-only.scss' with { loader: 'text' };
import fromBrandScss from '../../../examples/palette/from-brand.scss' with { loader: 'text' };
import derivedOutputCss from '../../../examples/palette/derived.output.css' with { loader: 'text' };
import contrastPreferenceScss from '../../../examples/palette/contrast-preference.scss' with {
  loader: 'text',
};
import contrastPreferenceHtml from '../../../examples/palette/contrast-preference.html' with {
  loader: 'text',
};
import contrastFixedScss from '../../../examples/palette/contrast-fixed.scss' with {
  loader: 'text',
};
import textRoleScss from '../../../examples/palette/text-role.scss' with { loader: 'text' };
import textExplicitScss from '../../../examples/palette/text-explicit.scss' with {
  loader: 'text',
};
import surfaceContainersScss from '../../../examples/palette/surface-containers.scss' with {
  loader: 'text',
};
import { ThemeExampleComponent } from '../../shared/theme-example.component';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'Brand, accents and neutrals', anchor: 'chain' },
  { label: 'Runtime derivatives', anchor: 'runtime-derivatives' },
  { label: 'Brand colours that take white text', anchor: 'brand-text' },
  { label: 'An accent as text', anchor: 'accent-text' },
  { label: 'Surface containers', anchor: 'surface-containers' },
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
  imports: [CodeComponent, ThemeExampleComponent],
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
          input is not; only the tints carry an alpha. A palette can prefer white or black instead,
          down to 3:1: see <a href="#brand-text">Brand colours that take white text</a>.
        </p>
      </section>

      <section id="brand-text" class="page-section">
        <h2>Brand colours that take white text</h2>
        <p>
          Brand guidelines often pair a mid-tone colour with white: a red header with a white logo.
          <code>--contrast</code> is chosen by luminance, and for such a colour it picks black. On
          <code>#e65151</code> black text is 5.66:1 and white text 3.71:1. To state the brand's
          rule, give the palette a preference with <code>$contrast</code>:
        </p>
        <cpa-code [code]="ex.contrastPreferenceScss" lang="scss" />
        <p>
          With <code>prefer-white</code>, the palette's colour and each of its ladder steps take
          white text wherever white reaches 3:1 on them, and black everywhere else, so a step too
          light for white still gets black. <code>prefer-black</code> is the mirror: black wherever
          black reaches 3:1, white elsewhere. Without <code>$contrast</code> nothing changes: text
          is the one of the two that reaches 4.5:1. The preference covers the colour itself and its
          steps (<code>--color--brand--contrast</code>, <code>--color--brand--dark--contrast</code>,
          the <code>--high</code> and <code>--low</code> aliases and so on); the palette's
          <code>--bg</code> and <code>--stroke</code> roles keep the default choice.
        </p>
        <cpa-theme-example
          title="A brand that prefers white text"
          [attrsHtml]="ex.contrastPreferenceHtml"
        />
        <p>
          <strong>What 3:1 is enough for.</strong> 3:1 is what WCAG asks of large text (24px, or
          18.66px bold) and of icons, so a header's title and its icons pass on the brand colour.
          Smaller text needs 4.5:1. There are two ways to give it that. Put it on the next step,
          <code>--color--brand--dark</code> (<code>tone="high"</code> in light mode): for
          <code>#e65151</code> that is <code>#bb252e</code>, where white is 6.13:1. Or make the
          header colour slightly darker: <code>#e65151</code> with 0.05 less oklch lightness is
          <code>#d44042</code>, where white is 4.55:1.
        </p>
        <p>
          <strong>Brand and primary.</strong> <code>brand</code> is identity: the header, the logo,
          a few highlights. <code>primary</code> is interaction: buttons, links, the selected state.
          They do not have to be the same hue. When the guidelines add an accent of another hue, a
          blue beside the red, pass it as <code>primary</code>: it stays out of the brand's areas
          and goes on the interactive elements of the content.
        </p>
        <p>
          <strong>A red brand next to <code>error</code>.</strong> Inside the content a red means
          that something went wrong. Keep the brand red out of the content area, and keep
          <code>error</code> a distinct red that comes with an icon, so it is never told apart by
          colour alone.
        </p>
        <p>
          <strong>Nested themes.</strong> The preference belongs to the theme that passes it. The
          elements inside that theme inherit it; a theme nested inside chooses its text by the
          default rule again unless it passes the preference too.
        </p>
        <p>
          <strong>One fixed text colour.</strong> To use one text colour whatever the palette's
          colour is, set the variable in a rule of your own, after the theme. Nothing checks its
          contrast then:
        </p>
        <cpa-code [code]="ex.contrastFixedScss" lang="scss" />
      </section>

      <section id="accent-text" class="page-section">
        <h2>An accent as text</h2>
        <p>
          <code>--color--primary</code> is the colour as you wrote it. That is right for a fill: a
          button, a badge, a bar. As text on the page it is often too light. <code>#e65151</code> is
          3.71:1 on white, and text needs 4.5:1.
        </p>
        <p>
          So every accent palette has a <code>text</code> role, <code>--color--primary--text</code>,
          and <code>--palette-color--text</code> inside a <code>palette</code> scope. It is the same
          colour with its lightness limited: no lighter than 0.40 in light mode and no darker than
          0.82 in dark mode, in oklch. The hue stays, and the chroma is lowered only as far as the
          screen needs to show the colour. For <code>#e65151</code> in light mode that is
          <code>#85151d</code>, 9.92:1 on white. A colour already past the limit is left as it is.
        </p>
        <p>Use it for your own coloured text: links, headings, prices, labels.</p>
        <cpa-code [code]="ex.textRoleScss" lang="scss" />
        <p>
          <strong>Fills, icons and lines keep the colour.</strong> A fill is
          <code>--color--primary</code>, with <code>--color--primary--contrast</code> as the text on
          it. A line (a border, an underline, an outline) is <code>--color--primary--stroke</code>.
          A line needs 3:1, not 4.5:1, so the stroke is the colour itself wherever a line in it
          shows on the page: lightness 0.42 to 0.55 in light mode, 0.65 or more in dark mode. A
          colour outside that range is moved into it, and, like the text role, a stroke gives up
          chroma when the screen cannot show the colour.
        </p>
        <p>
          <strong>With Angular Material.</strong> The Material adapter gives the same two roles to
          what Material paints in an accent: the label of a text button and the focused label of a
          field read the text role, the focused outline and the caret read the stroke. A link next
          to a button is the same colour. The ng-material API page lists the tokens.
        </p>
        <p>
          <strong>A text colour of your own.</strong> Pass <code>$text</code> to use another one.
          Given in one mode only, it applies in both:
        </p>
        <cpa-code [code]="ex.textExplicitScss" lang="scss" />
        <p>
          <code>background</code> and <code>surface</code> have no text role. The text on them is
          their <code>--contrast</code>.
        </p>
      </section>

      <section id="surface-containers" class="page-section">
        <h2>Surface containers</h2>
        <p>
          The surface has five more colours, each a small step away from it, for what sits on the
          surface: a card, a side panel, a toolbar, a dialog, the well of a text field. Each has a
          <code>--contrast</code> for the text on it.
        </p>
        <div class="swatch-grid">
          @for (c of surfaceContainers; track c.token) {
            <div
              class="swatch-chip"
              [style.background]="'var(' + c.token + ')'"
              [style.color]="'var(' + c.token + '--contrast)'"
            >
              <code [title]="c.token">{{ c.token.slice(18) || 'surface' }}</code>
              <span class="swatch-aa">{{ c.light }} / {{ c.dark }}</span>
            </div>
          }
        </div>
        <p>
          They are Material 3's surface containers, under M3's names and at M3's distance from the
          surface: <code>--color--surface--container-lowest</code>, <code>-low</code>,
          <code>--color--surface--container</code>, <code>-high</code> and <code>-highest</code>.
          The two numbers on each one above are that distance in oklch lightness, in light mode and
          in dark mode. In light mode <code>container-lowest</code> is a little lighter than the
          surface and the other four are darker in turn. In dark mode it is the other way round. Hue
          and chroma are the surface's.
        </p>
        <cpa-code [code]="ex.surfaceContainersScss" lang="scss" />
        <p>
          <strong>With Angular Material.</strong> The Material adapter reads these five for
          <code>--mat-sys-surface-container-lowest</code> to
          <code>--mat-sys-surface-container-highest</code>, so a panel of your own and a Material
          card beside it are one colour. The ng-material API page lists which cp-theming variable
          each Material role equals.
        </p>
        <p>
          <strong>They are not the shade steps.</strong> <code>--color--surface--high</code>,
          <code>--higher</code> and <code>--highest</code> are steps of 0.12, which every palette
          has in both directions. The containers are closer together and differ by mode, so the two
          scales do not line up. Use a container for a panel that should match Material, and a shade
          step for emphasis.
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
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$contrast</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$text</span
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
                  roles are derived from this value. Required. For an accent, write a colour the
                  screen can show (inside sRGB; every hex colour is): one outside it is painted
                  clipped, while its stroke and text keep its hue with less chroma, so they would
                  not match the fill. The Sass build warns about such a colour and names the one to
                  write instead.
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
                  Override for the border role (<code>--color--name--stroke</code>). Derived when
                  left out: the colour with its lightness kept between 0.42 and 0.55 in light mode
                  and at 0.65 or more in dark mode, inside sRGB, or, for <code>background</code> and
                  <code>surface</code>, a boundary 4.5:1 or more against the palette's own colour in
                  either mode. The Material adapter's outlines are the surface's stroke; a focused
                  field's outline is the accent's.
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
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$contrast</span
                  ><span class="api-param-type">prefer-white | prefer-black?</span
                  ><span class="api-param-default">default by luminance</span>
                </div>
                <div class="api-param-desc">
                  The text colour the palette's colour and its ladder steps take wherever that
                  colour reaches 3:1 on them; the other one elsewhere. Left out, text is black or
                  white by luminance, at 4.5:1 or more. In one config of
                  <code>t.light-dark()</code> it applies in that mode only. Any other value is a
                  Sass error. See <a href="#brand-text">Brand colours that take white text</a>.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$text</span><span class="api-param-type">color?</span
                  ><span class="api-param-default">default derived</span>
                </div>
                <div class="api-param-desc">
                  Override for the text role (<code>--color--name--text</code>): the palette's
                  colour as text. Derived when left out: the colour, no lighter than 0.40 in light
                  mode and no darker than 0.82 in dark mode. Not for <code>background</code> or
                  <code>surface</code>, where it is a Sass error. See
                  <a href="#accent-text">An accent as text</a>.
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
    contrastPreferenceScss,
    contrastPreferenceHtml,
    contrastFixedScss,
    textRoleScss,
    textExplicitScss,
    surfaceContainersScss,
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

  /**
   * The surface and its five containers, in M3's order, with the lightness
   * between each one and the surface in light and in dark mode
   * (test/surface-scale.test.ts holds the numbers to the compiled core.css).
   */
  readonly surfaceContainers = [
    { token: '--color--surface--container-lowest', light: '+0.017', dark: '−0.024' },
    { token: '--color--surface', light: '0', dark: '0' },
    { token: '--color--surface--container-low', light: '−0.017', dark: '+0.036' },
    { token: '--color--surface--container', light: '−0.035', dark: '+0.053' },
    { token: '--color--surface--container-high', light: '−0.052', dark: '+0.097' },
    { token: '--color--surface--container-highest', light: '−0.069', dark: '+0.140' },
  ];

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
