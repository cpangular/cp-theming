import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import { LiveControl, LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/01-one-colour/theme.scss' with { loader: 'text' };
import exampleHtml from '../../../examples/learn/01-one-colour/example.html' with {
  loader: 'text',
};
import exampleScss from '../../../examples/learn/01-one-colour/example.scss' with {
  loader: 'text',
};
import tryNamedTheme from '../../../examples/learn/01-one-colour/try-named.theme.scss' with {
  loader: 'text',
};
import tryTwoTheme from '../../../examples/learn/01-one-colour/try-two.theme.scss' with {
  loader: 'text',
};
import tryTwoHtml from '../../../examples/learn/01-one-colour/try-two.html' with { loader: 'text' };

@Component({
  selector: 'cpa-learn-one-colour',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="1">
      <div chapterExample>
        <p class="learn-lead">Pick a colour. Every box below it is worked out from that one.</p>
        <cpa-live-example
          chapter="01-one-colour"
          [files]="files"
          [frames]="example"
          [control]="picker"
        />
      </div>

      <div chapterIdea>
        <p>
          You chose one colour and the example shows ten: your colour, three darker steps, three
          lighter ones, a soft background, a border and a focus ring. On every fill there is also
          text, in black or in white, whichever can be read there. Watch the text while you drag the
          picker from a dark colour to a light one: it flips.
        </p>
        <p>
          None of those colours is written down anywhere. Each is a CSS variable whose value is a
          formula over your colour, such as "the same colour, a little darker". The browser works
          the formulas out, and works them out again whenever the colour changes. That is why
          everything moved with the picker: nothing was rebuilt and no script computed a colour.
        </p>
        <p>Two words name what you are looking at.</p>
        <ul>
          <li>
            A <strong>palette</strong> is one colour with a name, together with everything worked
            out from it. This palette is named <em>primary</em>, so its colour is the variable
            <cpa-ref name="--color--primary" />. For any palette that variable is
            <cpa-ref name="--color--{name}" />, where <em>name</em> stands for the palette's name.
            Everything worked out from the colour starts with the same words: the steps are
            <cpa-ref name="--color--{name}--dark" /> and <cpa-ref name="--color--{name}--light" />,
            then darker, darkest, lighter and lightest.
          </li>
          <li>
            A <strong>theme</strong> is a set of palettes with a name of its own. This theme is
            called <em>ocean</em> and has one palette. It applies to the element that carries
            <cpa-ref name="theme" value="ocean" /> and to everything inside that element.
          </li>
        </ul>
        <p>
          The text colour has a variable too: <cpa-ref name="--color--{name}--contrast" /> is black
          or white, whichever reads on the palette's colour. Every step has one of its own (the name
          of the step, then <em>contrast</em>). So when you fill something with a palette colour you
          do not choose the text colour: you use the contrast that belongs to the fill.
        </p>
        <p>
          This rules out two habits. You do not compute shades ahead of time with Sass functions
          such as <code>darken()</code>, and you do not keep a list of shades, 100 to 900, for every
          colour. A theme holds the few colours you chose. Because the rest is worked out in the
          browser, a colour can change while the page is open and everything that depends on it
          follows.
        </p>
      </div>

      <div chapterCode>
        <p>
          A theme is written in Sass, because cp-theming's functions are Sass functions. This is the
          whole stylesheet behind the example:
        </p>
        <cpa-code [code]="files['theme.scss']" lang="scss" />
        <p>
          If Sass is new to you, two lines need a word. <code>&#64;use</code> loads cp-theming and
          calls it <code>t</code> for short. <code>&#64;include</code> runs a mixin, which is a
          named piece of Sass that writes CSS into your stylesheet.
        </p>
        <ul>
          <li>
            <cpa-ref name="t.palette()" /> makes a palette from a colour.
            <cpa-ref name="t.theme()" /> makes a theme from palettes: its
            <cpa-ref name="$palettes" /> argument is a list of them by name.
          </li>
          <li>
            <cpa-ref name="t.define-core-theme()" /> is a mixin. It writes the part every theme
            shares, which is where the formulas are. Include it once in a site, before any theme.
          </li>
          <li>
            <cpa-ref name="t.define-theme()" /> is the other mixin. It writes the theme under the
            name you give it. All it adds to the CSS is one rule that holds the colour you passed.
          </li>
        </ul>
        <p>
          Using the result takes no Sass. Put <cpa-ref name="theme" value="ocean" /> on an element,
          and inside it read the variables with <code>var()</code> like any others. The example's
          own stylesheet, <em>example.scss</em> beside the example, is plain CSS that does only
          that.
        </p>
      </div>

      <div chapterTry>
        <p>Each tab swaps one or two of the example's files. The swapped file is marked.</p>
        <ul>
          <li>
            <strong>A colour by name.</strong> The theme passes <code>gold</code>. Any CSS colour
            will do: a hex value, <code>rgb()</code>, <code>hsl()</code>, <code>oklch()</code>, a
            name. On this light colour the text has turned black, and the lighter steps run out at
            white.
          </li>
          <li>
            <strong>Two themes.</strong> A second theme, <em>forest</em>, in the same stylesheet,
            and the same markup under each. The only difference between the two halves is the value
            of <cpa-ref name="theme" />.
          </li>
        </ul>
        <cpa-live-example chapter="01-one-colour" [files]="files" [frames]="tryIt" />
      </div>

      <span chapterNow>
        write a theme that passes one colour, apply it to an element, and use that colour, its
        lighter and darker steps and the text colour for each in your own CSS.
      </span>
    </cpa-chapter>
  `,
})
export class OneColourChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'try-named.theme.scss': tryNamedTheme,
    'try-two.theme.scss': tryTwoTheme,
    'try-two.html': tryTwoHtml,
  };

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];

  // The picker sets the colour the theme passes as its primary, on the element
  // that carries the theme. That colour is stored as a light value and a dark
  // value; the picker sets both to the same colour, as the theme does.
  protected readonly picker: LiveControl = {
    label: 'The colour this theme is given',
    value: '#2f6fde',
    target: '[theme]',
    properties: ['--color--primary--mode-light', '--color--primary--mode-dark'],
  };

  protected readonly tryIt: LiveFrame[] = [
    { frame: 'try-named', label: 'A colour by name' },
    { frame: 'try-two', label: 'Two themes' },
  ];
}
