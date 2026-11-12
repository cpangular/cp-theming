import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import { LiveControl, LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/08-everything-else/theme.scss' with {
  loader: 'text',
};
import exampleHtml from '../../../examples/learn/08-everything-else/example.html' with {
  loader: 'text',
};
import exampleScss from '../../../examples/learn/08-everything-else/example.scss' with {
  loader: 'text',
};
import tryOwnTheme from '../../../examples/learn/08-everything-else/try-own.theme.scss' with {
  loader: 'text',
};
import tryScopeHtml from '../../../examples/learn/08-everything-else/try-scope.html' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-everything-else',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="8">
      <div chapterExample>
        <p class="learn-lead">
          A card and six sliders. Five of them change a value the theme carries, on the element with
          the theme. The Shadow slider sets how deep the card's shadow is. None of them changes a
          palette's colour, though Quiet text changes how two colours are mixed.
        </p>
        <cpa-live-example
          chapter="08-everything-else"
          [files]="files"
          [frames]="example"
          [controls]="sliders"
        />
      </div>

      <div chapterIdea>
        <p>
          A design has more constants than its colours: how much room things have, how round the
          corners are, how deep a shadow is, how fast things move, how far a quiet line of text
          steps back, which sizes of type exist. In most stylesheets these are numbers typed where
          they are needed, 16px here and 8px there, and changing "the spacing" means finding them
          all.
        </p>
        <p>
          A theme carries them the way it carries colours. Each is a CSS variable with a name and a
          default, set on the theme's element and inherited by everything inside it. A few also have
          an attribute that sets them for one element and what is inside it, as
          <cpa-ref name="themeMode" /> does for modes. What chapters 1 to 6 said about colours holds
          for all of them: a theme passes only the ones it changes, and a theme inside another
          inherits the rest. When a value changes, the browser works out again whatever depends on
          it. The sliders only change a value, and the browser does the rest.
        </p>
        <ul>
          <li>
            <strong>Spacing.</strong> <cpa-ref name="--space--{size}" /> is a scale of seven sizes:
            xxs, xs, sm, md, lg, xl and xxl. All seven follow one number, the
            <strong>density</strong>, which is 0 unless you change it. At 0 they run from 2px to
            48px. Below 0 every space shrinks together, and above 0 every space grows.
            <cpa-ref name="themeDensity" /> puts an element and everything inside it in a density
            from -5 to 5. The Density slider sets it on the theme's element.
            <cpa-ref name="container" /> gives an element padding of the lg size, so the padding
            follows the density too. (This attribute is not the same thing as the variables of
            chapter 5 whose names start with container.)
          </li>
          <li>
            <strong>Shape.</strong> <cpa-ref name="--shape--{size}" /> is a scale of corner sizes
            with the same names, xxs to xxl, and <em>full</em> for a pill.
            <cpa-ref name="shape" value="md" /> rounds an element with one of them.
          </li>
          <li>
            <strong>Elevation.</strong> <cpa-ref name="--elevation-N--shadow" /> is a shadow, for N
            from 0 (none) to 5 (deepest). <cpa-ref name="elevated" value="2" /> puts one on an
            element. The shadow is darker in dark mode, where a faint one would not show.
          </li>
          <li>
            <strong>Motion.</strong> <cpa-ref name="--motion--{name}" /> holds four durations
            (duration-short, duration-medium, duration-long and duration-extra) and four easing
            curves (easing-standard, easing-emphasized, easing-decelerate and easing-accelerate),
            for your transitions and animations. The pulsing dot beside "Syncing" uses
            duration-extra and easing-standard, and the Pulse slider changes the duration.
          </li>
          <li>
            <strong>Weights.</strong> <cpa-ref name="--weight--{name}" /> are percentages, not font
            weights. One sets how much of the text colour a quieter line keeps: the colour of
            "Renews on 1 March", <cpa-ref name="--container--text-deemphasis" /> from chapter 5, is
            the text colour mixed with the card's fill at that percentage. The Quiet text slider
            changes it. Others set how strong each of the five tints of chapter 4 is, and how strong
            the wash over a hovered or pressed element is.
          </li>
          <li>
            <strong>Type.</strong> <cpa-ref name="--text--{role}--{property}" /> is a set of fifteen
            text styles: display, headline, title, body and label, each in large, medium and small.
            In the name, <em>role</em> is the style, written as the kind and the size joined by a
            dash, such as title-large. Every style has a font, a size, a line height, a weight and a
            tracking (its letter spacing). The card's title is title-large and its other text is
            body-medium.
          </li>
        </ul>
        <p>
          Like <cpa-ref name="bg" /> and <cpa-ref name="filled" /> in chapter 5,
          <cpa-ref name="container" /> and <cpa-ref name="shape" /> go on the same element as
          <cpa-ref name="palette" />. <cpa-ref name="elevated" /> and
          <cpa-ref name="themeDensity" /> work on any element.
        </p>
        <p>
          So you no longer type numbers for spacing, corners and timing all through a stylesheet, or
          keep a second "compact" stylesheet for the dense parts of an application. A dense table is
          the same table inside a density.
        </p>
      </div>

      <div chapterCode>
        <p>
          The example's theme passes a colour and nothing else, so every number is at its default.
          To change them, <cpa-ref name="t.theme()" /> takes one argument for each kind, built by a
          function that accepts only the values you want to change: <cpa-ref name="t.density()" />,
          <cpa-ref name="t.shape()" />, <cpa-ref name="t.elevation()" />,
          <cpa-ref name="t.motion()" />, <cpa-ref name="t.weights()" /> and
          <cpa-ref name="t.typography()" />.
        </p>
        <cpa-code [code]="files['try-own.theme.scss']" lang="scss" />
        <p>
          From the top, this theme changes the density, two corner sizes, the colour of the shadows,
          the extra duration, the weight behind the quiet line, and the font of every text style
          (display and headline follow it unless the theme gives them a font of their own). A
          <cpa-ref name="themeDensity" /> attribute inside this theme replaces its density from that
          element inward: the two do not add up.
        </p>
        <p>
          In your own CSS the variables are read like the colours. This is the example's stylesheet.
          Every font, gap, corner and duration above "Layout only" comes from the theme. The numbers
          under it only place the example on the page.
        </p>
        <cpa-code [code]="files['example.scss']" lang="scss" />
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>Numbers of its own.</strong> The theme in the code above: tighter, squarer, a
            serif face, a violet shadow, a slower pulse and a quiet line that is less quiet. The
            HTML and the example's stylesheet are unchanged.
          </li>
          <li>
            <strong>A density on one element.</strong> The card twice. The second has
            <cpa-ref name="themeDensity" value="-2" />, and every space inside it is smaller: its
            padding, the gaps between its lines, the padding of its buttons.
          </li>
        </ul>
        <cpa-live-example chapter="08-everything-else" [files]="files" [frames]="tryIt" />
      </div>

      <span chapterNow>
        take spacing, corners, shadows, timing, weights and type from the theme in place of typing
        numbers, change any of them for a whole theme, and tighten one part of a page with a
        density.
      </span>
    </cpa-chapter>
  `,
})
export class EverythingElseChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'try-own.theme.scss': tryOwnTheme,
    'try-scope.html': tryScopeHtml,
  };

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];

  // Each slider sets one input of the theme on the element that carries it (or,
  // for the shadow, the level on the card), starting from core's default.
  protected readonly sliders: LiveControl[] = [
    {
      label: 'Density',
      value: '0',
      range: { min: -5, max: 5 },
      target: '[theme]',
      attribute: 'themeDensity',
    },
    {
      label: 'Corners',
      value: '12',
      range: { min: 0, max: 32, unit: 'px' },
      target: '[theme]',
      properties: ['--shape--md'],
    },
    {
      label: 'Shadow',
      value: '2',
      range: { min: 0, max: 5 },
      target: 'article',
      attribute: 'elevated',
    },
    {
      label: 'Pulse',
      value: '500',
      range: { min: 100, max: 2000, step: 100, unit: 'ms' },
      target: '[theme]',
      properties: ['--motion--duration-extra'],
    },
    {
      label: 'Quiet text',
      value: '55',
      range: { min: 20, max: 100, unit: '%' },
      target: '[theme]',
      properties: [
        '--weight--text-deemphasis-blend--mode-light',
        '--weight--text-deemphasis-blend--mode-dark',
      ],
    },
    {
      label: 'Title size',
      value: '22',
      range: { min: 14, max: 28, unit: 'px' },
      target: '[theme]',
      properties: ['--text--title-large--size'],
    },
  ];

  protected readonly tryIt: LiveFrame[] = [
    { frame: 'try-own', label: 'Numbers of its own' },
    { frame: 'try-scope', label: 'A density on one element' },
  ];
}
