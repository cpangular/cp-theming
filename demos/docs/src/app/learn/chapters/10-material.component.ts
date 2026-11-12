import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CodeComponent } from '../../shared/code.component';
import {
  GalleryAccent,
  GalleryOverlayTheme,
} from '../../packages/pages/components/gallery.components';
import { ChapterComponent } from '../chapter.component';
import { LivePanel, LiveTemplateComponent } from '../live-template.component';
import { RefComponent } from '../ref.component';
import { LearnMaterialExample } from './10-material.examples';
import themeScss from '../../../examples/learn/10-material/theme.scss' with { loader: 'text' };
import exampleNgHtml from '../../../examples/learn/10-material/example.ng.html' with {
  loader: 'text',
};
import buttonsNgHtml from '../../../examples/components/buttons.ng.html' with { loader: 'text' };
import accentNgHtml from '../../../examples/components/accent.ng.html' with { loader: 'text' };
import overlayThemeNgHtml from '../../../examples/components/overlay-theme.ng.html' with {
  loader: 'text',
};
import overlaysNgHtml from '../../../examples/components/overlays.ng.html' with { loader: 'text' };
import overlayScopeTs from '../../../examples/components/overlay-scope.ts.txt' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-material',
  standalone: true,
  imports: [ChapterComponent, LiveTemplateComponent, CodeComponent, RefComponent],
  // What the gallery page gives its examples: the datepicker of the overlays one needs it.
  providers: [provideNativeDateAdapter()],
  template: `
    <cpa-chapter [n]="10">
      <div chapterExample>
        <p class="learn-lead">
          The Buttons example of the Components gallery, three times: in a theme, in a theme inside
          it, and in a palette inside that. Point at a button to see where its colours come from.
        </p>
        <cpa-live-template [panels]="example" [roles]="true" />
      </div>

      <div chapterIdea>
        <p>
          Angular Material's components know nothing of cp-theming. They take their colours from
          Material's own variables, a fixed set whose names start with
          <cpa-ref name="--mat-sys-*" />. Each is named after a job, like the roles of chapter 4:
          one for the main fill, one for the text on it, one for a surface, one for an outline. A
          filled button reads the first two.
        </p>
        <p>
          The <strong>adapter</strong> is a stylesheet that declares every one of those variables
          from the variables your theme already has. Where cp-theming has a variable for the same
          job, Material's simply points at it: the main fill is your primary, and the text on it is
          your primary's contrast. Where Material wants a shade that cp-theming has no name for, the
          adapter works it out from one of your colours by the rules of Material's own design, and
          the browser does the arithmetic, as it does for your steps. Point at buttons in the
          example: the line under it reads both halves out of the stylesheets the page is running.
        </p>
        <p>Two things follow from doing it at that level.</p>
        <ul>
          <li>
            Nothing is mapped component by component. A Material component you add tomorrow is
            themed already, because it reads the same variables as the ones you have.
          </li>
          <li>
            Material's variables are declared on every element that carries a theme, so they are
            worked out again inside a nested theme (chapter 6). And a
            <cpa-ref name="palette" /> scope (chapter 5) points the main ones at its own palette, so
            the buttons in the innermost box are tertiary without being told.
          </li>
        </ul>
        <p>
          One kind of component does not follow the element it is in. Material draws a menu, a
          dialog, a tooltip and other <strong>overlays</strong> in a container at the end of the
          page, outside the element that opened them. They take the theme and the mode of the page,
          not of a nested theme. The gallery uses a small directive,
          <cpa-ref name="cpaOverlayScope" />, that copies the theme and mode of an element onto that
          container. It belongs to this site and is not part of the library: copy it if you nest
          themes around overlays.
        </p>
        <p>
          And a few components do not take every colour from the shared variables, or combine them
          in a way that is hard to read with some colours. For those the adapter has a second,
          optional part: <strong>patches</strong>, each a small correction for a case that was
          measured in the gallery.
        </p>
        <p>
          This rules out a Material theme written beside your own and kept in step with it, and
          colour overrides for individual components in your application.
        </p>
      </div>

      <div chapterCode>
        <p>
          The adapter is a package of its own,
          <code>&#64;cpangular/cp-theming-ng-material</code>, with two mixins.
          <cpa-ref name="define-ng-material-core-theme()" /> declares Material's variables;
          <cpa-ref name="apply-material-overrides()" /> adds the patches. Both are included once,
          after core and the themes:
        </p>
        <cpa-code [code]="themeScss" lang="scss" />
        <p>
          Nothing else changes. The templates use Material as Material documents it, and the
          attributes of the earlier chapters go on any element around the components:
          <em>example.ng.html</em> beside the example, with the gallery's
          <em>buttons.ng.html</em> inside it.
        </p>
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>Other components in a palette.</strong> The gallery's example of a button, a
            checkbox and a switch inside <cpa-ref name="palette" value="tertiary" />. None of them
            is told its colour.
          </li>
          <li>
            <strong>Overlays in a nested theme.</strong> The gallery's example of a nested theme
            with <cpa-ref name="cpaOverlayScope" /> on it. Open the menu or the dialog: it is drawn
            outside the box and still has the box's theme. The directive's source is the third file.
          </li>
        </ul>
        <cpa-live-template [panels]="tryIt" />
      </div>

      <span chapterNow>
        use Angular Material with a cp-theming theme by adding two includes, colour its components
        with the same themes, modes and palette scopes as the rest of the page, and say what to do
        about overlays inside a nested theme.
      </span>
    </cpa-chapter>
  `,
})
export class MaterialChapterComponent {
  protected readonly themeScss = themeScss;

  protected readonly example: LivePanel[] = [
    {
      label: 'Example',
      component: LearnMaterialExample,
      files: [
        { name: 'example.ng.html', code: exampleNgHtml },
        { name: 'buttons.ng.html', code: buttonsNgHtml },
        { name: 'theme.scss', code: themeScss },
      ],
    },
  ];

  protected readonly tryIt: LivePanel[] = [
    {
      label: 'Other components in a palette',
      component: GalleryAccent,
      files: [{ name: 'accent.ng.html', code: accentNgHtml }],
    },
    {
      label: 'Overlays in a nested theme',
      component: GalleryOverlayTheme,
      files: [
        { name: 'overlay-theme.ng.html', code: overlayThemeNgHtml },
        { name: 'overlays.ng.html', code: overlaysNgHtml },
        { name: 'overlay-scope.ts', code: overlayScopeTs },
      ],
    },
  ];
}
