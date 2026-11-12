import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import {
  LiveControl,
  LiveExampleComponent,
  LiveFrame,
  LiveMeasure,
} from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/07-contrast/theme.scss' with { loader: 'text' };
import exampleHtml from '../../../examples/learn/07-contrast/example.html' with { loader: 'text' };
import exampleScss from '../../../examples/learn/07-contrast/example.scss' with { loader: 'text' };
import tryYellowTheme from '../../../examples/learn/07-contrast/try-yellow.theme.scss' with {
  loader: 'text',
};
import tryBlueTheme from '../../../examples/learn/07-contrast/try-blue.theme.scss' with {
  loader: 'text',
};
import tryFixedHtml from '../../../examples/learn/07-contrast/try-fixed.html' with {
  loader: 'text',
};
import tryFixedScss from '../../../examples/learn/07-contrast/try-fixed.scss' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-contrast',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="7">
      <div chapterExample>
        <p class="learn-lead">
          Drag the slider. It changes how light the one colour this theme passes is, its primary,
          and nothing else about it. Near the light end a screen cannot show a blue this strong, so
          the colour turns towards cyan. The four numbers are contrast ratios, measured in the
          example while it runs.
        </p>
        <cpa-live-example
          chapter="07-contrast"
          [files]="files"
          [frames]="example"
          [controls]="[lightness]"
          [measures]="measures"
        />
      </div>

      <div chapterIdea>
        <p>
          Text can be read when it differs enough in brightness from what is behind it. The Web
          Content Accessibility Guidelines, WCAG for short, put a number on "enough". The contrast
          ratio of two colours runs from 1:1, the same colour twice, to 21:1, black on white. For
          ordinary text the guidelines ask for 4.5:1 or more.
        </p>
        <p>
          For text on a fill there are two candidates, black and white. On a dark fill white has the
          higher ratio; on a light fill black has. Make the fill lighter a little at a time and
          white's ratio falls while black's rises. At one brightness the two are equal, and there
          both are about 4.6:1.
        </p>
        <p>
          That crossing is where cp-theming switches. A fill darker than the crossing gets white
          text, and a fill lighter than it gets black. So the ratio between a fill and its contrast
          colour is lowest exactly at the switch, and even there it is above 4.5:1. Watch the first
          number while you drag: it is lowest where the text flips, and it never goes under 4.5.
        </p>
        <p>
          No check runs on the colours afterwards, and there is no setting to get wrong: the result
          follows from where the switch is. It holds for every contrast colour,
          <cpa-ref name="--color--{name}--contrast" /> and the ones named like it: on the colour of
          any palette, on each of its steps, and on its bg and stroke roles and their steps. The
          mode, the theme and the colour you pass make no difference. The second number is the
          lowest of the six steps in the example.
        </p>
        <p>
          This guarantee covers one case exactly:
          <strong>text on an opaque fill, written in that fill's contrast colour</strong>. Two
          things in the example are outside it, and their numbers can go under 4.5. On a light page
          the colour as text goes under as the colour gets light, and the tint goes under at the
          dark end. If this site is dark it is the other way round, and the colour as text is under
          from the start.
        </p>
        <ul>
          <li>
            <strong>A tint.</strong> A tint (<cpa-ref name="--color--{name}--tint-N" />) is
            see-through, so what is behind the text is a mix of the tint and whatever is under it.
            No contrast variable can know that mix. The example puts the page's own text on the
            tint: the contrast of the background palette of chapter 3. Keep tints for washes over
            places where the text could already be read, such as a hovered row.
          </li>
          <li>
            <strong>The colour used as text.</strong> Here the colour is not behind the text, it is
            the text, and the page is behind it. Whether that can be read depends on the colour
            against the page. The primary that chapter 3 generates from a brand colour is made dark
            enough in light mode and light enough in dark mode for exactly this use. A colour you
            pass yourself, like this example's, is used as you passed it.
          </li>
        </ul>
        <p>
          So you no longer choose a text colour for each fill by hand, or keep a table of "text on"
          colours beside the palette that has to be revisited whenever a colour changes.
        </p>
      </div>

      <div chapterCode>
        <p>
          There is no function to call. The guarantee is in using the pair: a fill, and the contrast
          of that same fill. This is the example's stylesheet; the first rule is all it takes.
        </p>
        <cpa-code [code]="files['example.scss']" lang="scss" />
        <p>
          On an element with <cpa-ref name="palette" />, the <cpa-ref name="filled" /> attribute
          from chapter 5 sets that pair for you, and so does <cpa-ref name="bg" /> on the background
          and surface palettes.
        </p>
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>A yellow, then a blue.</strong> Two themes whose colour is written in
            <code>hsl()</code>, which has a lightness number of its own. Here the slider changes
            that number. The two colours start at the same lightness, and the yellow has black text
            where the blue has white. Drag each: the yellow keeps black text until it is quite dark,
            and the blue keeps white text until it is quite light. The switch does not go by a
            lightness number. It goes by how bright the colour is on the screen, and a yellow is far
            brighter than a blue. (The lightness of <code>oklch()</code>, in the main example,
            follows brightness closely, so there the text flips at about the same lightness for any
            hue.) In both, the first number stays above 4.5.
          </li>
          <li>
            <strong>The four fixed palettes.</strong> Every theme also has four palettes that
            chapter 3 did not list: <em>error</em>, <em>warn</em>, <em>caution</em> and
            <em>pass</em>. Nothing generates them. Each has a default colour for light and for dark
            that you can replace by passing your own (this tab keeps the defaults), and each is a
            palette like any other, with steps, roles and a contrast. As fills, with their contrast
            colour on them, they are inside the guarantee. As text on the surface palette, the
            default warn and caution fall a little short in light mode: they are bright colours on a
            bright surface. For a warning in words, put the words on the fill.
          </li>
        </ul>
        <cpa-live-example chapter="07-contrast" [files]="files" [frames]="tryIt" />
      </div>

      <span chapterNow>
        say which text is readable without checking it (anything on an opaque fill, in that fill's
        contrast) and which text you still have to look at yourself: text on a tint, and a colour
        used as text.
      </span>
    </cpa-chapter>
  `,
})
export class ContrastChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'try-yellow.theme.scss': tryYellowTheme,
    'try-blue.theme.scss': tryBlueTheme,
    'try-fixed.html': tryFixedHtml,
    'try-fixed.scss': tryFixedScss,
  };

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];

  // The slider sets the lightness of the colour the theme passes, on the
  // element that carries the theme: the first number of its oklch() colour, in
  // the light and the dark value alike, as the theme file has it.
  protected readonly lightness: LiveControl = {
    label: 'Lightness',
    value: '45',
    range: { min: 5, max: 95, unit: '%' },
    target: '[theme]',
    properties: ['--color--primary--mode-light', '--color--primary--mode-dark'],
    format: 'oklch({}% 0.13 250)',
  };

  protected readonly measures: LiveMeasure[] = [
    { label: 'Text on the colour', selector: '.fill' },
    { label: 'Lowest of the six steps', selector: '.steps p' },
    { label: 'Page text on the tint', selector: '.wash' },
    { label: 'The colour as text', selector: '.words' },
  ];

  protected readonly tryIt: LiveFrame[] = [
    {
      frame: 'try-yellow',
      label: 'A yellow',
      controls: [{ ...this.lightness, format: 'hsl(60 100% {}%)' }],
      measures: this.measures,
    },
    {
      frame: 'try-blue',
      label: 'A blue',
      controls: [{ ...this.lightness, format: 'hsl(240 100% {}%)' }],
      measures: this.measures,
    },
    {
      frame: 'try-fixed',
      label: 'The four fixed palettes',
      measures: [
        { label: 'Lowest of the four fills', selector: '.fill' },
        { label: 'error as text', selector: '.words.error' },
        { label: 'warn as text', selector: '.words.warn' },
        { label: 'caution as text', selector: '.words.caution' },
        { label: 'pass as text', selector: '.words.pass' },
      ],
    },
  ];
}
