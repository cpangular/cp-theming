import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import { LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/11-package/theme.scss' with { loader: 'text' };
import exampleHtml from '../../../examples/learn/11-package/example.html' with { loader: 'text' };
import exampleScss from '../../../examples/learn/11-package/example.scss' with { loader: 'text' };
import cssThemeCss from '../../../examples/learn/11-package/css.theme.css' with { loader: 'text' };
import tryOverrideTheme from '../../../examples/learn/11-package/try-override.theme.scss' with {
  loader: 'text',
};
import tryNamedTheme from '../../../examples/learn/11-package/try-named.theme.scss' with {
  loader: 'text',
};
// The package itself, as it is in this repository (demos/demo-brand-core):
// test/theme-packages.test.ts holds these two imports to the package's files.
import packageIndexScss from '../../../../../demo-brand-core/scss/_index.scss' with {
  loader: 'text',
};
import packageJson from '../../../../../demo-brand-core/package.json' with { loader: 'text' };

@Component({
  selector: 'cpa-learn-package',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="11">
      <div chapterExample>
        <p class="learn-lead">
          Two apps of one company, Acme. The first is built with Sass and the second is not. Neither
          defines a theme: both take it from a package, <code>&#64;acme/theme</code>. The file open
          beside each app is everything its stylesheet says about the theme.
        </p>
        <p><strong>An app with Sass</strong></p>
        <cpa-live-example
          chapter="11-package"
          [files]="files"
          [frames]="withSass"
          [themeFirst]="true"
        />
        <p><strong>An app without Sass</strong></p>
        <cpa-live-example
          chapter="11-package"
          [files]="files"
          [frames]="withoutSass"
          [themeFirst]="true"
        />
      </div>

      <div chapterIdea>
        <p>
          In every chapter so far the theme was written in the stylesheet of the page that used it.
          A company with several apps wants the same theme in all of them, and wants to change it in
          one place. Copying the theme file into each app does not give that: the copies drift
          apart. What apps share is a <strong>package</strong>: a folder with a name and a version
          number that each app installs, the way it installs cp-theming.
        </p>
        <p>
          A theme package is small. It holds one Sass file that builds the theme, as chapter 3 did,
          and one CSS file compiled from it. It has no script and no components. The two files are
          the two ways in, and the two examples are one of each.
        </p>
        <ul>
          <li>
            <strong>With Sass.</strong> The app loads the package's Sass file and includes a mixin
            from it, <cpa-ref name="define()" />. The mixin writes the theme into the app's own
            stylesheet, exactly where <cpa-ref name="t.define-theme()" /> stood in the earlier
            chapters.
          </li>
          <li>
            <strong>Without Sass.</strong> The app loads the compiled CSS file. It holds the rule
            the mixin would have written.
          </li>
        </ul>
        <p>
          Either way the app ends up with the same theme rule, which is why the two examples look
          the same. The theme has a name, <em>acme</em>, and the package gives it that name, so it
          is the same in every app. All an app's HTML needs is
          <cpa-ref name="theme" value="acme" /> on an element. Everything from the earlier chapters
          then works inside it: the example's markup uses <cpa-ref name="palette" />,
          <cpa-ref name="bg" /> and <cpa-ref name="filled" /> and never names a colour.
        </p>
        <p>
          One thing is not in the package: cp-theming itself. Core, the part every theme shares
          (chapter 1), is neither in the package's Sass nor in its CSS file. Each app includes core
          once, before the theme: it is the first thing in both stylesheets above. The package only
          states which versions of cp-theming it works with. That statement is called a
          <strong>peer dependency</strong>. It leaves the choice of version to the app, so an app
          never gets two copies of core, and it can take a fix in cp-theming without waiting for a
          new theme package.
        </p>
        <p>
          The package also makes its theme the default (<cpa-ref name="$default" />, chapter 6), so
          a page that names no theme is Acme's too. You can see it in the examples: the margin
          around each app is outside the element with the attribute and has Acme's background
          colour.
        </p>
        <p>
          A package is for sharing. An app that is the only user of its theme does not need one: the
          theme in its own stylesheet, as in the earlier chapters, is enough.
        </p>
      </div>

      <div chapterCode>
        <p>
          The package in the examples is real. It is the folder <em>demos/demo-brand-core</em> of
          cp-theming's repository, and the two files below are shown as they are there. This is the
          Sass file that builds the theme, <em>scss/_index.scss</em>:
        </p>
        <cpa-code [code]="packageIndexScss" lang="scss" />
        <ul>
          <li>
            <cpa-ref name="$theme" /> is the theme, built with <cpa-ref name="t.theme()" /> from
            what the company has: a brand colour (<cpa-ref name="$brand" />, chapter 3), one palette
            of its own and its corners (chapter 8). It is a variable of the file, so an app can read
            it.
          </li>
          <li>
            <cpa-ref name="define()" /> is one line around <cpa-ref name="t.define-theme()" />. The
            name <em>acme</em> is written here and nowhere else. An app that has a default theme of
            its own passes <cpa-ref name="$default" /> as false.
          </li>
          <li>
            The file does not include <cpa-ref name="t.define-core-theme()" />. That is the app's
            line.
          </li>
        </ul>
        <p>And this is the package's description, <em>package.json</em>:</p>
        <cpa-code [code]="packageJson" lang="json" />
        <ul>
          <li>
            <code>exports</code> lists what an app may load. The first entry is what
            <code>&#64;use "&#64;acme/theme"</code> finds: a file <em>_index.scss</em> at the top of
            the package, one line long, that passes on <em>scss/_index.scss</em>.
            <code>./css</code> is the compiled file, the one the second example imports.
          </li>
          <li>
            <code>files</code> is what the published package contains: that one-line file, the
            <em>scss</em> folder and the compiled CSS in <em>dist</em>.
          </li>
          <li>
            <code>peerDependencies</code> is the peer dependency. <code>workspace:^</code> is how
            this repository writes it, because here the package sits beside cp-theming. In a package
            of your own, write the version you built against with a caret in front, such as
            <code>^0.1.0</code>: that version or a later one that is compatible with it.
          </li>
          <li>
            <code>build</code> compiles the CSS file from <em>scss/acme.scss</em>, which is two
            lines: load the file above and include <cpa-ref name="define()" />.
            <code>pack:check</code> lists the files that would be published, without publishing.
          </li>
          <li>
            <code>private</code> is there because this example is never published. A real package
            leaves it out.
          </li>
        </ul>
        <p>
          For apps that use Angular Material (chapter 10) the repository has a second package,
          <code>&#64;acme/theme-material</code>, in <em>demos/demo-brand-material</em>. Its
          <cpa-ref name="define()" /> includes this theme, the adapter and its patches, and Acme's
          own patches, so such an app also has one include.
        </p>
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>One palette changed by the app.</strong> An app may need one colour to differ
            and still take the rest from the package. A palette's colour is stored as two custom
            properties, <cpa-ref name="--color--{name}--mode-light" /> and
            <cpa-ref name="--color--{name}--mode-dark" />: its light value and its dark value. The
            app sets that pair for the tertiary in a rule of its own, in plain CSS, and the
            <em>Gift</em> label turns red. This works the same in an app without Sass.
          </li>
          <li>
            <strong>Not the default.</strong> The app passes <cpa-ref name="$default" /> as false.
            The app looks the same, because its element has the attribute. The margin around it is
            the plain grey of a page with no theme.
          </li>
        </ul>
        <cpa-live-example
          chapter="11-package"
          [files]="files"
          [frames]="tryIt"
          [themeFirst]="true"
        />
      </div>

      <span chapterNow>
        put a theme in a package with a Sass file and a compiled CSS file, keep cp-theming a peer
        dependency of it, and use the theme from an app with Sass or without.
      </span>
    </cpa-chapter>
  `,
})
export class PackageChapterComponent {
  protected readonly packageIndexScss = packageIndexScss;
  // The build's `text` loader makes this import the file's text. TypeScript
  // reads a .json import as the object it holds, so it is told otherwise.
  protected readonly packageJson = packageJson as unknown as string;

  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'css.theme.css': cssThemeCss,
    'try-override.theme.scss': tryOverrideTheme,
    'try-named.theme.scss': tryNamedTheme,
  };

  protected readonly withSass: LiveFrame[] = [{ frame: 'example', label: 'With Sass' }];
  protected readonly withoutSass: LiveFrame[] = [{ frame: 'css', label: 'Without Sass' }];

  protected readonly tryIt: LiveFrame[] = [
    { frame: 'try-override', label: 'One palette changed by the app' },
    { frame: 'try-named', label: 'Not the default' },
  ];
}
