import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import { LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/02-light-and-dark/theme.scss' with {
  loader: 'text',
};
import exampleHtml from '../../../examples/learn/02-light-and-dark/example.html' with {
  loader: 'text',
};
import exampleScss from '../../../examples/learn/02-light-and-dark/example.scss' with {
  loader: 'text',
};
import tryOneColourTheme from '../../../examples/learn/02-light-and-dark/try-one-colour.theme.scss' with {
  loader: 'text',
};
import trySwappedHtml from '../../../examples/learn/02-light-and-dark/try-swapped.html' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-light-and-dark',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="2">
      <div chapterExample>
        <p class="learn-lead">
          Four copies of one card, in three sections. There is one theme, in <em>theme.scss</em>,
          and one set of rules for the card, in <em>example.scss</em>.
        </p>
        <cpa-live-example chapter="02-light-and-dark" [files]="files" [frames]="example" />
      </div>

      <div chapterIdea>
        <p>
          The four cards have the same markup and are styled by the same rules, and those rules
          never say "light" or "dark" (they are in <em>example.scss</em>). What differs is one
          attribute. <cpa-ref name="themeMode" /> puts an element and everything inside it in a
          mode: <code>light</code>, <code>dark</code>, or <code>auto</code>, which follows the
          setting of the reader's device. An element without the attribute is in the mode of the
          element around it. (The auto section follows your device, not this site's light and dark
          switch: on a light device it stays light while this site is dark.)
        </p>
        <p>
          So dark is not a second theme. Each colour variable of a theme holds two values, one for
          light and one for dark. When an element uses <cpa-ref name="--color--primary" />, the
          browser takes the value for the mode <em>that element</em> is in. This is CSS's own
          <code>light-dark()</code> at work: the variable holds both values, and
          <cpa-ref name="themeMode" /> sets the element's <code>color-scheme</code>, which picks
          one. The choice is made where the colour is used, one element at a time, and not once for
          the page. That is how the second card can be dark inside a light section: it is one
          element whose mode is dark, reading the same variables as its neighbour.
        </p>
        <p>
          The other colours worked out from a palette's colour follow the mode as well. The soft
          background (the variable ending in <em>bg</em>, from chapter 1) is pale in light mode and
          deep in dark mode, and the text on it changes from black to white.
        </p>
        <p>
          Modes need one more kind of step. The steps from chapter 1 point in a fixed direction:
          <cpa-ref name="--color--{name}--dark" /> is always darker. But "make this title stronger"
          means darker on a light page and lighter on a dark one. For that, every colour also has
          steps named by what they do:
        </p>
        <ul>
          <li>
            <cpa-ref name="--color--{name}--high" /> stands out more from what is around it: one
            step darker in light mode, one step lighter in dark mode. The card's title is the high
            step of the palette's colour. The card's fill is the high step of the soft background,
            and its text is that step's contrast.
          </li>
          <li>
            <cpa-ref name="--color--{name}--low" /> stands out less: one step lighter in light mode,
            one step darker in dark mode. The card's border is the low step of the border colour
            (the variable ending in <em>stroke</em>, from chapter 1): a quieter line than the border
            colour itself.
          </li>
        </ul>
        <p>
          As with dark, darker and darkest, there are three each way: high, higher and highest, and
          low, lower and lowest. Each has a contrast of its own, named as in chapter 1. The example
          uses high and low only. <em>example.scss</em> shows how the names add up: the soft
          background, then <em>high</em>, then <em>contrast</em>.
        </p>
        <p>
          So you need no dark stylesheet, no rules like <code>.dark .card</code> that repeat every
          colour, and no media queries for the device's setting in your own CSS. You write each rule
          once.
        </p>
      </div>

      <div chapterCode>
        <p>
          A colour that reads on white is usually too dark on black, so you can give a palette two
          colours, one for each mode. <cpa-ref name="t.light-dark()" /> takes the colour for light,
          then the colour for dark. The rest of the file is as in chapter 1:
        </p>
        <cpa-code [code]="files['theme.scss']" lang="scss" />
        <p>
          A palette passed without <cpa-ref name="t.light-dark()" />, as in chapter 1, uses its one
          colour in both modes.
        </p>
        <p>
          The mode is not in the stylesheet at all. It is set in the HTML, with
          <cpa-ref name="themeMode" /> on any element: see <em>example.html</em> beside the example,
          where the second card is <cpa-ref name="themeMode" value="dark" /> inside a section that
          is <cpa-ref name="themeMode" value="light" />.
        </p>
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>One colour for both modes.</strong> The theme passes its primary without
            <cpa-ref name="t.light-dark()" />. The soft backgrounds and the text on them still
            follow the mode, because they are worked out per mode. The colour itself does not: the
            button is the same blue on every card, and the title, one step away from that blue, is
            hard to read on the dark cards. That is what the second colour is for.
          </li>
          <li>
            <strong>Modes swapped.</strong> A light card inside a dark section, and in the other
            section a mode on something as small as a button.
          </li>
        </ul>
        <cpa-live-example chapter="02-light-and-dark" [files]="files" [frames]="tryIt" />
      </div>

      <span chapterNow>
        give a palette a colour for light and a colour for dark, put any element in either mode, and
        write styles that are right in both by using the high and low steps.
      </span>
    </cpa-chapter>
  `,
})
export class LightAndDarkChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'try-one-colour.theme.scss': tryOneColourTheme,
    'try-swapped.html': trySwappedHtml,
  };

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];

  protected readonly tryIt: LiveFrame[] = [
    { frame: 'try-one-colour', label: 'One colour for both modes' },
    { frame: 'try-swapped', label: 'Modes swapped' },
  ];
}
