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
          This theme was given one colour, a bright amber, as its brand colour. It has six palettes,
          shown as six swatches under the two sentences.
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
          So the brand colour is passed on its own, apart from the palettes, and treated
          differently. It becomes a palette named <em>brand</em>. That palette's colour,
          <cpa-ref name="--color--brand" />, is exactly the colour you passed, in light mode and in
          dark mode. It is never adjusted. Use it where the colour has to be exact, such as a logo
          or a banner.
        </p>
        <p>
          The other palettes are generated from it in a fixed order, a chain. Primary comes from the
          brand. Secondary and tertiary come from primary. Background and surface come from the
          brand:
        </p>
        <p class="learn-chain">brand → primary → secondary and tertiary</p>
        <p class="learn-chain">brand → background and surface</p>
        <ul>
          <li>
            <strong>primary</strong> is the brand colour made dark or light enough to read. It keeps
            the hue, which is the kind of colour it is (amber stays amber), and is made darker for
            light mode and lighter for dark mode. The second sentence of the example is in it. This
            is the palette for links, buttons and anything that should look like the brand and still
            be readable.
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
            page; surface is for what sits on the page, such as a card. The example shows only their
            swatches.
          </li>
        </ul>
        <p>
          All six are palettes like the one in chapter 1. Each has its steps, its contrasts, its
          soft background and its border colour under its own name: with <em>secondary</em> as the
          name, <cpa-ref name="--color--{name}--contrast" /> is the text on the secondary swatch.
          The generated colours are formulas too, worked out by the browser like the steps.
        </p>
        <p>
          The rule is: <strong>pass what you have</strong>. A palette you pass is used exactly as
          you passed it, in both modes. A palette you leave out is generated from the palette before
          it in the chain, whether you passed that one or it was generated too. Nothing is generated
          from secondary, so passing your own secondary changes that palette and nothing else.
        </p>
        <p>
          If you pass a primary and no brand, as chapters 1 and 2 did, the brand palette is that
          primary, and secondary and tertiary are generated from it. Background and surface come
          only from a brand you pass, so this theme does not generate them. It takes them from
          around it: in this chapter's examples, the plain neutrals of a page with no theme. Chapter
          6 is about what a theme takes from around it. (A theme on the
          <code>&lt;html&gt;</code> element has nothing around it. There background and surface take
          a trace of the primary's hue.)
        </p>
      </div>

      <div chapterCode>
        <p>
          The brand colour is not one of the palettes in <cpa-ref name="$palettes" />. It has an
          argument of <cpa-ref name="t.theme()" /> to itself, <cpa-ref name="$brand" />:
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
            <strong>Own secondary.</strong> The second stylesheet in the code above. Only the
            secondary swatch changes.
          </li>
          <li>
            <strong>Primary, no brand.</strong> The theme passes a green primary and nothing else.
            Secondary and tertiary now come from the green, and the brand swatch shows the same
            green, so both sentences are readable. Background and surface are the plain neutrals,
            with no trace of green.
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
