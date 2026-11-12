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
          Only the round badge and the quieter line are coloured by the example's stylesheet. The
          attributes in the HTML colour everything else.
        </p>
        <cpa-live-example chapter="05-scopes" [files]="files" [frames]="example" />
      </div>

      <div chapterIdea>
        <p>
          The component in chapter 4 named its palette in every rule, so it needed Sass's
          <code>&#64;each</code> to write each rule again for every palette. Most of the time a
          piece of a page should not know which palette it is in. cp-theming's attributes split the
          question in two: which palette, and what to paint with it.
        </p>
        <p>
          <cpa-ref name="palette" /> answers the first. Putting an element in a palette does two
          things to it and to everything inside it. The text takes the palette's colour. And a set
          of variables is filled in that mean "the palette I am in":
          <cpa-ref name="--palette-color" />, <cpa-ref name="--palette-color--contrast" />, and one
          for each role of chapter 4, such as <cpa-ref name="--palette-color--bg" /> and
          <cpa-ref name="--palette-color--stroke" />. An element with <cpa-ref name="palette" />,
          together with everything inside it, is called a <strong>scope</strong>. The round badge in
          the example reads <cpa-ref name="--palette-color" /> and names no palette, so it takes the
          colour of the scope it is in: secondary here, and primary in the Try it below.
        </p>
        <p>
          Three more attributes paint. These are the <strong>surfaces</strong> of the chapter's
          title. Each goes on the same element as <cpa-ref name="palette" /> and paints with that
          palette:
        </p>
        <ul>
          <li>
            <cpa-ref name="bg" /> paints the soft background, the bg role of chapter 4: pale in
            light mode, deep in dark mode. The text keeps the palette's colour.
          </li>
          <li>
            <cpa-ref name="filled" /> paints the palette's colour itself. The text becomes its
            contrast, black or white, because the palette's colour is now behind the text and cannot
            also be the text.
          </li>
          <li>
            <cpa-ref name="outlined" /> draws a border in the stroke role and leaves the text alone.
            On its own it gives an outline with nothing inside. With <cpa-ref name="bg" /> it adds
            an edge to the fill. With <cpa-ref name="filled" /> the edge is drawn in the soft
            background colour, a faint line around the fill.
          </li>
        </ul>
        <p>
          One exception concerns background and surface, the palettes of chapter 3 that pages and
          cards are painted with. Their colour and their soft background are the same colour, so
          <cpa-ref name="bg" /> on those two makes the text the contrast, as
          <cpa-ref name="filled" /> does. This example does not use them. Chapter 6 does.
        </p>
        <p>
          <cpa-ref name="tone" /> slides the scope along the steps from chapter 2. With
          <code>tone="high"</code> the scope's colour becomes its high step, darker in light mode
          and lighter in dark mode. With <code>tone="low"</code> it becomes the low step. Whatever
          is painted from the scope moves with it: the fill, and the text colour that goes with it.
        </p>
        <p>
          <cpa-ref name="filled" /> also tells what is inside it which text colours read on its
          fill, in variables whose names start with <em>container</em>.
          <cpa-ref name="--container--text" /> is the contrast, and
          <cpa-ref name="--container--text-deemphasis" /> is a quieter version for a secondary line:
          "a quieter line" in the example uses it. <cpa-ref name="bg" /> does not set them. One
          more, <cpa-ref name="--container--stroke" />, is the colour
          <cpa-ref name="outlined" /> draws with. <cpa-ref name="palette" /> sets it to the stroke
          role, and <cpa-ref name="filled" /> changes it to the soft background.
        </p>
        <p>
          Scopes go inside scopes, and the nearest one wins. The tertiary chip sits in the secondary
          panel and stays tertiary. The badge beside it has no palette of its own, so it takes the
          panel's secondary.
        </p>
      </div>

      <div chapterCode>
        <p>
          The attributes are a shorthand. Each has a Sass mixin that does the same in a class of
          your own: <cpa-ref name="t.apply-palette()" />, <cpa-ref name="t.bg()" />,
          <cpa-ref name="t.filled()" />, <cpa-ref name="t.outlined()" /> and
          <cpa-ref name="t.tone()" />. This is the example again with classes in the HTML and the
          mixins in the stylesheet. Include the palette first, then the tone, then the fill, even
          when they are in separate rules as here: where two of them set the same property, the
          later rule wins.
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
