import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import { LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/03-generated/theme.scss' with { loader: 'text' };
import exampleHtml from '../../../examples/learn/03-generated/example.html' with { loader: 'text' };
import exampleScss from '../../../examples/learn/03-generated/example.scss' with { loader: 'text' };
import tryDarkHtml from '../../../examples/learn/03-generated/try-dark.html' with {
  loader: 'text',
};
import trySecondaryTheme from '../../../examples/learn/03-generated/try-secondary.theme.scss' with {
  loader: 'text',
};
import tryPrimaryTheme from '../../../examples/learn/03-generated/try-primary.theme.scss' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-generated',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="3">
      <div chapterExample>
        <p class="learn-lead">
          This theme was given one colour, a bright amber, as its brand colour. It has six palettes.
        </p>
        <cpa-live-example chapter="03-generated" [files]="files" [frames]="example" />
      </div>

      <div chapterIdea>
        <p>
          A brand colour is chosen to be recognised, not to be read. The first sentence of the
          example is written in this amber and is hard to read on a light page. A theme that used it
          as its main colour would have links and buttons nobody can read.
        </p>
        <p>
          So the brand colour is its own kind of input. It becomes a palette named
          <em>brand</em>, and the colour of that palette, <cpa-ref name="--color--brand" />, is
          exactly the colour you passed, in light mode and in dark mode. It is never adjusted. Use
          it where the colour has to be exact, such as a logo or a banner.
        </p>
        <p>The other palettes are generated from it, each from the one before, in a fixed order:</p>
        <p class="learn-chain">brand → primary → secondary and tertiary → background and surface</p>
        <ul>
          <li>
            <strong>primary</strong> is the brand colour moved to where it can be read. It keeps the
            hue, which is the kind of colour it is (amber stays amber), and is made darker for light
            mode and lighter for dark mode. The second sentence of the example is in it. This is the
            palette for links, buttons and anything that should look like the brand and still be
            readable.
          </li>
          <li>
            <strong>secondary</strong> is the primary with most of its colour taken out: a quiet
            companion. <strong>tertiary</strong> is the primary with its hue moved part of the way
            round the colour wheel, here from amber to green: a second colour that goes with the
            first.
          </li>
          <li>
            <strong>background</strong> and <strong>surface</strong> are nearly white in light mode
            and nearly black in dark mode, with a trace of the brand's hue. Background is for the
            page; surface is for what sits on the page, such as a card.
          </li>
        </ul>
        <p>
          All six are palettes like the one in chapter 1, so each has its steps and its contrast
          under its own name. And like the steps, the generated colours are worked out by the
          browser, not written into the stylesheet.
        </p>
        <p>
          The rule is: <strong>pass what you have</strong>. A palette you pass is used exactly as
          you passed it. A palette you leave out is generated from the nearest thing before it in
          the order that you did pass. Nothing is generated from secondary, so passing your own
          secondary changes that palette and nothing else. Pass a primary and no brand, as in
          chapters 1 and 2, and secondary and tertiary are generated from your primary, while the
          brand palette is simply that primary.
        </p>
      </div>

      <div chapterCode>
        <p>
          The brand colour is an argument of <cpa-ref name="t.theme()" /> itself,
          <cpa-ref name="$brand" />:
        </p>
        <cpa-code [code]="files['theme.scss']" lang="scss" />
        <p>
          To replace one generated palette, pass it by name in <cpa-ref name="$palettes" />, the way
          chapter 1 passed primary. Here the theme has its own secondary and keeps the rest:
        </p>
        <cpa-code [code]="files['try-secondary.theme.scss']" lang="scss" />
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>Dark.</strong> The example's HTML with
            <cpa-ref name="themeMode" value="dark" />. The brand swatch is the same amber. The
            primary is now a lighter amber, generated for dark mode. On a dark page the brand colour
            happens to be readable too; that is luck of this colour, not something to rely on.
          </li>
          <li>
            <strong>Own secondary.</strong> The second stylesheet above. Only the secondary swatch
            changes.
          </li>
          <li>
            <strong>Primary, no brand.</strong> The theme passes a green primary and nothing else.
            Secondary and tertiary now come from the green, the brand swatch shows the same green,
            and both sentences are readable.
          </li>
        </ul>
        <cpa-live-example chapter="03-generated" [files]="files" [frames]="tryIt" />
      </div>

      <span chapterNow>
        start a theme from a brand colour alone, say which of its six palettes are exact and which
        are generated, and replace any one of them with a colour of your own.
      </span>
    </cpa-chapter>
  `,
})
export class GeneratedChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'try-dark.html': tryDarkHtml,
    'try-secondary.theme.scss': trySecondaryTheme,
    'try-primary.theme.scss': tryPrimaryTheme,
  };

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];

  protected readonly tryIt: LiveFrame[] = [
    { frame: 'try-dark', label: 'Dark' },
    { frame: 'try-secondary', label: 'Own secondary' },
    { frame: 'try-primary', label: 'Primary, no brand' },
  ];
}
