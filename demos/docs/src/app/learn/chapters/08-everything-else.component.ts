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
          A card and six sliders. Each slider changes one number of the theme. None of them is a
          colour.
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
          A theme carries them the way it carries colours. Each is a variable with a name and a
          default, set on the theme's element and inherited by everything inside it. What chapters 1
          to 6 said about colours holds for all of them: a theme passes only the ones it changes, a
          theme inside another inherits the rest, and when a value changes the browser works out
          again whatever depends on it. That last part is all the sliders do.
        </p>
        <ul>
          <li>
            <strong>Spacing.</strong> <cpa-ref name="--space--{size}" /> is a scale of seven sizes
            from xxs to xxl, 2px to 48px. All seven hang on one number, the density: lower it and
            every space shrinks together. <cpa-ref name="themeDensity" /> puts an element and
            everything inside it in a density from -5 to 5, the way
            <cpa-ref name="themeMode" /> does for a mode. The first slider sets it on the theme's
            element. <cpa-ref name="container" /> gives an element the scale's standard padding.
          </li>
          <li>
            <strong>Shape.</strong> <cpa-ref name="--shape--{size}" /> is a scale of corner sizes,
            xxs to xxl, and <em>full</em> for a pill. <cpa-ref name="shape" value="md" /> rounds an
            element with one of them.
          </li>
          <li>
            <strong>Elevation.</strong> <cpa-ref name="--elevation-N--shadow" /> is a shadow, for N
            from 0 (none) to 5 (deepest). <cpa-ref name="elevated" value="2" /> puts one on an
            element. The shadow is darker in dark mode, where a faint one would not show.
          </li>
          <li>
            <strong>Motion.</strong> <cpa-ref name="--motion--{name}" /> holds four durations
            (short, medium, long, extra) and four easing curves, for your transitions and
            animations. The pulsing dot uses the extra duration.
          </li>
          <li>
            <strong>Weights.</strong> <cpa-ref name="--weight--{name}" /> are percentages: how
            strong a hover or a press wash is, how strong each of the five tints of chapter 4 is,
            and how much of the text colour a quieter line keeps. That last one is behind
            <cpa-ref name="--container--text-deemphasis" /> from chapter 5, the colour of "Renews on
            1 March".
          </li>
          <li>
            <strong>Type.</strong> <cpa-ref name="--text--{role}--{property}" /> is a set of fifteen
            text styles: display, headline, title, body and label, each in large, medium and small.
            Every style has a font, a size, a line height, a weight and a letter spacing. The card's
            title is the large title style.
          </li>
        </ul>
        <p>
          <cpa-ref name="container" /> and <cpa-ref name="shape" /> are layers like the ones in
          chapter 5: they go on an element that has <cpa-ref name="palette" />.
          <cpa-ref name="elevated" /> and <cpa-ref name="themeDensity" /> work on any element.
        </p>
        <p>
          This rules out numbers scattered through a stylesheet, and a second "compact" stylesheet
          for the dense parts of an application. A dense table is the same table inside a density.
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
          In your own CSS the variables are read like the colours. This is the example's stylesheet:
          every font, gap, corner and duration in it comes from the theme.
        </p>
        <cpa-code [code]="files['example.scss']" lang="scss" />
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>Numbers of its own.</strong> The theme above: tighter, squarer, a serif face, a
            violet shadow, a slower pulse and a quiet line that is less quiet. The HTML and the
            example's stylesheet are unchanged.
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
