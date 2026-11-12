import { Component } from '@angular/core';
import { ChapterComponent } from '../chapter.component';
import { LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/05-scopes/theme.scss' with { loader: 'text' };
import exampleHtml from '../../../examples/learn/05-scopes/example.html' with { loader: 'text' };
import exampleScss from '../../../examples/learn/05-scopes/example.scss' with { loader: 'text' };
import classesHtml from '../../../examples/learn/05-scopes/classes.html' with { loader: 'text' };
import classesScss from '../../../examples/learn/05-scopes/classes.scss' with { loader: 'text' };
import trySwappedHtml from '../../../examples/learn/05-scopes/try-swapped.html' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-scopes',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, RefComponent],
  template: `
    <cpa-chapter [n]="5">
      <div chapterExample>
        <p class="learn-lead">
          Almost nothing here is coloured by the example's stylesheet. The attributes in the HTML do
          it.
        </p>
        <cpa-live-example chapter="05-scopes" [files]="files" [frames]="example" />
      </div>

      <div chapterIdea>
        <p>
          The component in chapter 4 named its palette in every line, and Sass had to repeat the
          rules for each palette. Most of the time a piece of a page should not know which palette
          it is in. cp-theming's attributes split the question in two: which palette, and what to
          paint with it.
        </p>
        <p>
          <cpa-ref name="palette" /> answers the first. It puts an element and everything inside it
          in a palette, which does two things. The text takes the palette's colour. And a set of
          variables is filled in that mean "the palette I am in":
          <cpa-ref name="--palette-color" />, <cpa-ref name="--palette-color--contrast" />,
          <cpa-ref name="--palette-color--bg" />, <cpa-ref name="--palette-color--stroke" /> and the
          rest, with the names from chapter 4. This is called a <strong>scope</strong>. The round
          badge in the example reads <cpa-ref name="--palette-color" /> and names no palette, so it
          would be right in any scope.
        </p>
        <p>
          Three more attributes paint. Each goes on an element that also has
          <cpa-ref name="palette" />, and each gives you a text colour that fits what it painted:
        </p>
        <ul>
          <li>
            <cpa-ref name="bg" /> paints the soft fill, the bg role. The text stays the palette's
            colour: coloured text on a pale version of itself.
          </li>
          <li>
            <cpa-ref name="filled" /> paints the palette's colour itself. The text becomes its
            contrast, black or white, because the palette's colour is now behind the text and cannot
            also be the text.
          </li>
          <li>
            <cpa-ref name="outlined" /> draws a border in the stroke role and leaves the text alone.
            On its own it gives an outline with nothing inside; with <cpa-ref name="bg" /> or
            <cpa-ref name="filled" /> it adds an edge to the fill.
          </li>
        </ul>
        <p>
          One exception: the background and surface palettes are fills already, so on those two
          <cpa-ref name="bg" /> gives contrast text, as <cpa-ref name="filled" /> does.
        </p>
        <p>
          <cpa-ref name="tone" /> slides the scope along the steps from chapter 2. With
          <code>tone="high"</code> the scope's colour is the high step, with
          <code>tone="low"</code> the low one, and whatever is painted from the scope moves with it,
          text included.
        </p>
        <p>
          A filled element also tells its contents which text colours work on it:
          <cpa-ref name="--container--text" /> is the contrast, and
          <cpa-ref name="--container--text-deemphasis" /> is a quieter version for a secondary line,
          used by "a quieter line" in the example. <cpa-ref name="--container--stroke" /> is the
          colour <cpa-ref name="outlined" /> draws with.
        </p>
        <p>
          Scopes go inside scopes, and the nearest one wins: the tertiary label sits in the
          secondary panel and is unaffected by it.
        </p>
      </div>

      <div chapterCode>
        <p>
          The attributes are a shorthand. Each has a Sass mixin that does the same in a class of
          your own: <cpa-ref name="t.apply-palette()" />, <cpa-ref name="t.bg()" />,
          <cpa-ref name="t.filled()" />, <cpa-ref name="t.outlined()" /> and
          <cpa-ref name="t.tone()" />. This is the example again with classes in the HTML and the
          mixins in the stylesheet. Include the palette first, then the tone, then the fill.
        </p>
        <cpa-live-example chapter="05-scopes" [files]="files" [frames]="classes" />
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>Palettes swapped.</strong> Every <code>primary</code> in the HTML is now
            <code>tertiary</code>, and the two panels have other palettes. No stylesheet changed.
            The fills, borders, text colours and the badge all follow.
          </li>
        </ul>
        <cpa-live-example chapter="05-scopes" [files]="files" [frames]="tryIt" />
      </div>

      <span chapterNow>
        colour any piece of a page with attributes alone, know which text colour each fill gives and
        why, and write an element of your own that takes its colours from the scope it is put in.
      </span>
    </cpa-chapter>
  `,
})
export class ScopesChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'classes.html': classesHtml,
    'classes.scss': classesScss,
    'try-swapped.html': trySwappedHtml,
  };

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];
  protected readonly classes: LiveFrame[] = [{ frame: 'classes', label: 'With classes' }];
  protected readonly tryIt: LiveFrame[] = [
    { frame: 'example', label: 'As above' },
    { frame: 'try-swapped', label: 'Palettes swapped' },
  ];
}
