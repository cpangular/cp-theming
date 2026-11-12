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
          under each swatch says where that colour comes from.
        </p>
        <cpa-live-example chapter="06-nested" [files]="files" [frames]="example" />
      </div>

      <div chapterIdea>
        <p>
          Chapter 1 put two themes side by side. The <cpa-ref name="theme" /> attribute can also go
          on an element that is already inside a theme: a sidebar, one card, a preview pane. From
          that element inward the inner theme applies. But a theme passes a few colours and a page
          uses all of them, so the question is where the others come from.
        </p>
        <p>There are three answers, and every colour of an inner theme gets exactly one of them.</p>
        <ul>
          <li><strong>Passed.</strong> What the inner theme passes is used as it was passed.</li>
          <li>
            <strong>Generated.</strong> What follows from a passed colour, in the order of chapter 3
            (brand → primary → secondary and tertiary → background and surface), is generated again
            from the new colour.
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
            palettes are new and nothing is inherited. Its box even has its own page colour: the
            fill of each box is that theme's background palette.
          </li>
          <li>
            <em>moss</em> passes a primary. Secondary and tertiary follow from a primary, so they
            are generated from the green. Background and surface are only ever generated from a
            brand colour that was passed, and moss passed none, so they are inherited: the green
            accents sit on harbour's page. (Its brand palette is its primary, as chapter 3 said of
            any theme with a primary and no brand.)
          </li>
          <li>
            <em>plum</em> passes a secondary. Nothing follows from secondary. One palette changes
            and the other five are harbour's.
          </li>
        </ul>
        <p>
          Inherited means what it means everywhere in CSS: taken from the element around this one,
          whichever theme that is. An inner theme never names the theme it sits in, and it does not
          fall back to some standard set of colours for what it leaves out. Move plum into another
          theme and five of its palettes change with the move.
        </p>
        <p>
          That is why a theme can be small. A theme for one section of a site is the one colour that
          is different there. It rules out copying a whole theme to change a single colour, and
          keeping the copies in step afterwards.
        </p>
        <p>
          Modes are a separate matter. A theme does not set a mode, so an inner theme is in the mode
          of the element around it unless it carries <cpa-ref name="themeMode" /> itself.
        </p>
      </div>

      <div chapterCode>
        <p>
          The stylesheet behind the example defines four themes, one after the other. They do not
          affect each other: a theme applies only where an element carries its name. Core is still
          included once, however many themes follow it.
        </p>
        <cpa-code [code]="files['theme.scss']" lang="scss" />
        <p>
          The nesting is not in the stylesheet at all. It is in the HTML,
          <em>example.html</em> beside the example: an element with
          <cpa-ref name="theme" value="moss" /> inside the element with
          <cpa-ref name="theme" value="harbour" />.
        </p>
        <p>
          Written like this, a page with no <cpa-ref name="theme" /> attribute anywhere has none of
          the four. To make one of them the page's own, pass <cpa-ref name="$default" /> to
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
            harbour all the same, and so is the margin around it, which no element themes.
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
