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
          [controls]="[picker]"
        />
      </div>

      <div chapterIdea>
        <p>
          You chose one colour and the example shows ten: your colour, six <strong>steps</strong>,
          and a soft background, a border and a focus ring. A step is your colour made darker or
          lighter by a fixed amount, three steps each way. On every box filled with one of these
          colours there is also text, in black or in white, whichever can be read there. Watch the
          text while you drag the picker from a dark colour to a light one: it flips.
        </p>
        <p>
          Only your colour is written down. The other nine are not: each is a CSS variable whose
          value is a formula over your colour, such as "the same colour, a little darker". The
          browser works the formulas out, and works them out again whenever the colour changes. That
          is why everything moved with the picker. The picker only hands the theme a new colour:
          nothing was rebuilt, and no script worked out the other nine. (If this site is dark, the
          soft background is deep instead of pale. Chapter 2 is about that.)
        </p>
        <p>Two words name what you are looking at.</p>
        <ul>
          <li>
            A <strong>palette</strong> is one colour with a name, together with everything worked
            out from it. This palette is named <em>primary</em> in the theme file below, so its
            colour is the variable <cpa-ref name="--color--primary" />. For any palette that
            variable is <cpa-ref name="--color--{name}" />, where <em>name</em> stands for the
            palette's name. Everything worked out from the colour adds a word to that variable. The
            steps add the step's name: <cpa-ref name="--color--{name}--dark" /> and
            <cpa-ref name="--color--{name}--light" />, and in the same way darker, darkest, lighter
            and lightest. The soft background, the border and the focus ring add <em>bg</em>,
            <em>stroke</em> and <em>focus</em>. Chapter 4 is about those three.
          </li>
          <li>
            A <strong>theme</strong> is a set of palettes with a name of its own. This theme is
            called <em>ocean</em>, a name the theme file gives it, and has one palette. It applies
            to the element that carries <cpa-ref name="theme" value="ocean" /> and to everything
            inside that element.
          </li>
        </ul>
        <p>
          The text colour has a variable too: <cpa-ref name="--color--{name}--contrast" /> is black
          or white, whichever reads on the palette's colour. Each step has one of its own, named by
          adding <em>contrast</em> to the step's variable, and so has the soft background.
          <em>example.scss</em> beside the example spells out every one. So when you fill something
          with a palette colour you do not choose the text colour: you use the contrast that belongs
          to the fill.
        </p>
        <p>
          The browser works the colours out, so you can drop two habits. You do not compute shades
          ahead of time with Sass functions such as <code>darken()</code>, and you do not keep a
          list of shades, 100 to 900, for every colour. A theme holds the few colours you chose.
          Because the rest is worked out in the browser, a colour can change while the page is open
          and everything that depends on it follows.
        </p>
      </div>

      <div chapterCode>
        <p>
          cp-theming is a library of Sass functions and mixins that write CSS variables, so a theme
          is written in Sass. This is the whole stylesheet behind the example:
        </p>
        <cpa-code [code]="files['theme.scss']" lang="scss" />
        <p>
          If Sass is new to you, a few things need a word. <code>&#64;use</code> loads cp-theming
          from its package, <code>&#64;cpangular/cp-theming-core</code>, and calls it
          <code>t</code> for short. A name that starts with <code>$</code> is a Sass variable: it
          holds a value while the stylesheet is compiled. <code>( key: value )</code> is a Sass map,
          a list of values by name. <code>&#64;include</code> runs a mixin, which is a named piece
          of Sass that writes CSS into your stylesheet.
        </p>
        <ul>
          <li>
            <cpa-ref name="t.palette()" /> makes a palette from a colour.
            <cpa-ref name="t.theme()" /> makes a theme from palettes. Its
            <cpa-ref name="$palettes" /> argument is a map from each palette's name to the palette:
            the key <em>primary</em> is what puts <em>primary</em> into
            <cpa-ref name="--color--primary" />.
          </li>
          <li>
            <cpa-ref name="t.define-core-theme()" /> is a mixin. It writes the part every theme
            shares, called <strong>core</strong>: the formulas that work the steps, the contrasts
            and the rest out of a palette's colour. Include it once in a site, before any theme.
          </li>
          <li>
            <cpa-ref name="t.define-theme()" /> is the other mixin. Its first argument is the name,
            in quotes, and that name is the value the <cpa-ref name="theme" /> attribute takes. The
            Sass variable that holds the theme can be called anything. All this mixin adds to the
            CSS is one rule, for the elements with <cpa-ref name="theme" value="ocean" />, that
            holds the colour you passed.
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
            <strong>A colour by name.</strong> The theme passes <code>gold</code>, a CSS colour
            name. Any CSS colour will do: a hex value, <code>rgb()</code>, <code>hsl()</code>,
            <code>oklch()</code> or a name (the examples use a hex value and a name). On this light
            colour the text has turned black. The three lighter steps have run out of room: there is
            no lighter version of this yellow, so all three are the same bright yellow.
          </li>
          <li>
            <strong>Two themes.</strong> A second theme, <em>forest</em>, in the same stylesheet,
            and the same markup under each. The only difference between the two halves is the value
            of <cpa-ref name="theme" />. To keep it short, this tab leaves out the soft background,
            the border and the focus ring.
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
