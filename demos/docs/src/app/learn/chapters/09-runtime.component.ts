import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import { LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/09-runtime/theme.scss' with { loader: 'text' };
import headHtml from '../../../examples/learn/09-runtime/head.html' with { loader: 'text' };
import exampleHtml from '../../../examples/learn/09-runtime/example.html' with { loader: 'text' };
import exampleScss from '../../../examples/learn/09-runtime/example.scss' with { loader: 'text' };
import exampleTs from '../../../examples/learn/09-runtime/example.ts.txt' with { loader: 'text' };
import tryToggleHtml from '../../../examples/learn/09-runtime/try-toggle.html' with {
  loader: 'text',
};
import tryToggleTs from '../../../examples/learn/09-runtime/try-toggle.ts.txt' with {
  loader: 'text',
};
import tryUnsavedTs from '../../../examples/learn/09-runtime/try-unsaved.ts.txt' with {
  loader: 'text',
};
import provideTs from '../../../examples/learn/09-runtime/provide.app.ts.txt' with {
  loader: 'text',
};
import switcherTs from '../../../examples/learn/09-runtime/switcher.app.ts.txt' with {
  loader: 'text',
};
import switcherSetTs from '../../../examples/learn/09-runtime/switcher-set.app.ts.txt' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-runtime',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="9">
      <div chapterExample>
        <p class="learn-lead">
          Pick a theme and a mode, then press Reload. This example is a small page of its own, with
          a script.
        </p>
        <cpa-live-example
          chapter="09-runtime"
          [files]="files"
          [frames]="example"
          [ownMode]="true"
        />
      </div>

      <div chapterIdea>
        <p>
          Until now <cpa-ref name="theme" /> and <cpa-ref name="themeMode" /> were typed into the
          HTML. When the reader chooses, two things are needed: something that sets those attributes
          on a click, and something that remembers the choice for the next visit.
        </p>
        <p>
          The first is not a new mechanism. Switching a theme is setting the
          <cpa-ref name="theme" /> attribute, usually on the root element of the page, and the
          browser does the rest, as it did for the colour picker in chapter 1. Every theme is
          already in the stylesheet (chapter 6), so nothing is loaded and nothing is rebuilt.
          cp-theming's script functions are small conveniences around the two attributes:
        </p>
        <ul>
          <li>
            <cpa-ref name="setTheme()" /> and <cpa-ref name="setMode()" /> set the attribute and
            save the value.
          </li>
          <li><cpa-ref name="getTheme()" /> and <cpa-ref name="getMode()" /> read it.</li>
          <li>
            <cpa-ref name="watchTheme()" /> and <cpa-ref name="watchMode()" /> call a function of
            yours when it changes, whoever changed it. <cpa-ref name="watchMode()" /> also calls it
            when the mode is <code>auto</code> and the device goes from light to dark.
          </li>
        </ul>
        <p>
          Remembering has a catch. The saved choice has to be on the root element before the browser
          draws the page. A script that arrives with the rest of the page runs too late: the reader
          sees the default theme for a moment and then their own. So the restoring is done by a few
          lines of plain JavaScript that go in the page's head, ahead of the stylesheets:
          <cpa-ref name="themeHeadSnippet" />. It reads the saved theme and mode and sets the two
          attributes, and that is all it does. Press Reload in the example. The page comes back in
          the theme you chose without passing through ocean, its default.
        </p>
        <p>
          Saving is off until you turn it on. <cpa-ref name="configurePersistence()" /> says where
          choices are kept: in the browser's local storage, which lasts; in its session storage,
          which lasts until the tab is closed; or nowhere.
        </p>
        <p>
          This rules out keeping the theme in your application's own state and repainting from it,
          and loading a different stylesheet for each theme. The choice is one attribute and one
          saved word.
        </p>
      </div>

      <div chapterCode>
        <p>
          Two pieces. The first goes in the page's head, before the stylesheets. It is the text of
          <cpa-ref name="themeHeadSnippet" />, which the package exports so that a build can paste
          it in:
        </p>
        <cpa-code [code]="files['head.html']" lang="html" />
        <p>
          The second is the page's script. It imports the functions from
          <code>&#64;cpangular/cp-theming-core</code>; the buttons in <em>example.html</em> carry
          the name of a theme or a mode in a <code>data-</code> attribute.
        </p>
        <cpa-code [code]="files['example.ts.txt']" lang="typescript" />
        <p>
          In an Angular application the same two jobs are done by
          <cpa-ref name="provideTheme()" /> and <cpa-ref name="ThemeService" />, from
          <code>&#64;cpangular/cp-theming-ng-core</code>. <cpa-ref name="provideTheme()" /> goes in
          the application's providers. It turns saving on (local storage, unless you say otherwise)
          and restores the saved choice at startup. The snippet in the head is still what keeps the
          first frame right. This site's own configuration:
        </p>
        <cpa-code [code]="provideTs" lang="typescript" />
        <p>
          <cpa-ref name="ThemeService" /> gives a component the theme and the mode as signals, so a
          template that reads them updates by itself, and it has the two setters as methods. The
          switcher at the top right of this site is written with it:
        </p>
        <cpa-code [code]="switcherTs" lang="typescript" />
        <cpa-code [code]="switcherSetTs" lang="typescript" />
        <p>
          One thing about the example itself: it runs inside this site, so the docs keep what it
          saves apart from the theme this site has saved for you. Its files are what you would
          write.
        </p>
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>One toggle.</strong> A single button in place of the three modes. A mode can be
            <code>auto</code>, which is neither light nor dark, so the script asks
            <cpa-ref name="getEffectiveMode()" /> what the page is showing right now and sets the
            other one.
          </li>
          <li>
            <strong>Not saved.</strong> The script passes "nowhere" to
            <cpa-ref name="configurePersistence()" />. Switching works as before. Press Reload and
            the page is back at its default.
          </li>
        </ul>
        <cpa-live-example chapter="09-runtime" [files]="files" [frames]="tryIt" [ownMode]="true" />
      </div>

      <span chapterNow>
        let a reader choose the theme and the mode, keep the choice between visits, and bring it
        back before the first frame is drawn, in plain TypeScript or in Angular.
      </span>
    </cpa-chapter>
  `,
})
export class RuntimeChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'head.html': headHtml,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'example.ts.txt': exampleTs,
    'try-toggle.html': tryToggleHtml,
    'try-toggle.ts.txt': tryToggleTs,
    'try-unsaved.ts.txt': tryUnsavedTs,
  };

  protected readonly provideTs = provideTs;
  protected readonly switcherTs = switcherTs;
  protected readonly switcherSetTs = switcherSetTs;

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];

  protected readonly tryIt: LiveFrame[] = [
    { frame: 'try-toggle', label: 'One toggle' },
    { frame: 'try-unsaved', label: 'Not saved' },
  ];
}
