import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import { LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/06-nested/theme.scss' with { loader: 'text' };
import exampleHtml from '../../../examples/learn/06-nested/example.html' with { loader: 'text' };
import exampleScss from '../../../examples/learn/06-nested/example.scss' with { loader: 'text' };
import tryDefaultTheme from '../../../examples/learn/06-nested/try-default.theme.scss' with {
  loader: 'text',
};
import tryDefaultHtml from '../../../examples/learn/06-nested/try-default.html' with {
  loader: 'text',
};
import tryOuterHtml from '../../../examples/learn/06-nested/try-outer.html' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-nested',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="6">
      <div chapterExample>
        <p class="learn-lead">
          One theme with three others inside it. Each inner theme passes a single colour. The word
          under each swatch says where that colour comes from. The sixth palette, background, has no
          swatch: it is the fill of each box.
        </p>
        <cpa-live-example chapter="06-nested" [files]="files" [frames]="example" />
      </div>

      <div chapterIdea>
        <p>
          Chapter 1 put two themes side by side. The <cpa-ref name="theme" /> attribute can also go
          on an element that is already inside a theme: a sidebar, one card, a preview pane. From
          that element inward the inner theme applies. But a theme passes only a few colours, and a
          page uses all six palettes, so the question is where the rest come from.
        </p>
        <p>There are three answers, and every palette of an inner theme gets one of them.</p>
        <ul>
          <li><strong>Passed.</strong> What the inner theme passes is used as it was passed.</li>
          <li>
            <strong>Generated.</strong> What follows from a passed colour in the chain of chapter 3
            is generated again from it: secondary and tertiary from a primary, and everything else,
            background and surface included, from a brand.
          </li>
          <li>
            <strong>Inherited.</strong> Everything else keeps the value it has in the theme around
            it.
          </li>
        </ul>
        <p>The three inner themes show one case each:</p>
        <ul>
          <li>
            <em>ember</em> passes a brand colour. Everything follows from the brand, so all six
            palettes are new and nothing is inherited. Even the fill of its box, its background
            palette, is its own.
          </li>
          <li>
            <em>moss</em> passes a primary. Secondary and tertiary follow from a primary, so they
            are generated from the green. Background and surface come only from a brand, and moss
            passed none, so they are inherited: the green swatches sit on harbour's background. Its
            brand palette is the primary it passed, as chapter 3 said of any theme with a primary
            and no brand, so that swatch says <em>its primary</em>.
          </li>
          <li>
            <em>plum</em> passes a secondary. Nothing follows from secondary. One palette changes
            and the other five are harbour's.
          </li>
        </ul>
        <p>
          Inherited works as inheritance does everywhere in CSS: the value comes from the element
          around this one, from whichever theme applies there. An inner theme never names the theme
          it sits in, and it does not fall back to some standard set of colours for what it leaves
          out. Move plum into another theme and five of its palettes change with the move.
        </p>
        <p>
          That is why a theme can be small. A theme for one section of a site needs only the one
          colour that is different there. You never copy a whole theme to change a single colour,
          and never keep the copies in step afterwards.
        </p>
        <p>
          Modes are a separate matter. A theme does not set a mode, so an inner theme is in the mode
          of the element around it unless it carries <cpa-ref name="themeMode" /> itself. The
          example does not show this.
        </p>
      </div>

      <div chapterCode>
        <p>
          The stylesheet behind the example defines four themes, one after the other. They do not
          affect each other: a theme applies only where an element carries its name.
          <cpa-ref name="t.define-core-theme()" /> is still included once, before all four.
        </p>
        <cpa-code [code]="files['theme.scss']" lang="scss" />
        <p>
          The nesting is not in the stylesheet at all. It is in the HTML,
          <em>example.html</em> beside the example: an element with
          <cpa-ref name="theme" value="moss" /> inside the element with
          <cpa-ref name="theme" value="harbour" />. Each box is also painted with its theme's
          background palette, by <cpa-ref name="palette" value="background" /> and
          <cpa-ref name="bg" /> from chapter 5.
        </p>
        <p>
          With the stylesheet as it is, an element with no <cpa-ref name="theme" /> attribute on it
          or around it gets none of the four themes, only core's plain greys. To make one of them
          the page's own, pass <cpa-ref name="$default" />, set to true, to
          <cpa-ref name="t.define-theme()" />. That theme then also applies wherever no element
          names a theme, and any <cpa-ref name="theme" /> attribute still replaces it from that
          element inward. The last lines of the stylesheet become:
        </p>
        <cpa-code [code]="defaultLines" lang="scss" />
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>A default theme.</strong> The stylesheet with <cpa-ref name="$default" />, and
            the HTML with the outer <cpa-ref name="theme" /> attribute taken off. The outer box is
            harbour all the same, though no element names it.
          </li>
          <li>
            <strong>Another theme outside.</strong> The outer element is now ember, with harbour as
            the first inner theme. Nothing in the stylesheet changed. Moss keeps the greens it
            passed and generated, on ember's page. Plum keeps its secondary, and its other five
            palettes are now ember's.
          </li>
        </ul>
        <cpa-live-example chapter="06-nested" [files]="files" [frames]="tryIt" />
      </div>

      <span chapterNow>
        put a theme inside another and say which of its colours are passed, generated or inherited,
        keep several themes in one stylesheet, and make one of them the theme of the whole page.
      </span>
    </cpa-chapter>
  `,
})
export class NestedChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'try-default.theme.scss': tryDefaultTheme,
    'try-default.html': tryDefaultHtml,
    'try-outer.html': tryOuterHtml,
  };

  /** The end of the default-theme stylesheet: the lines that differ. */
  protected readonly defaultLines = tryDefaultTheme.slice(tryDefaultTheme.indexOf('// $default'));

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];

  protected readonly tryIt: LiveFrame[] = [
    { frame: 'try-default', label: 'A default theme' },
    { frame: 'try-outer', label: 'Another theme outside' },
  ];
}
