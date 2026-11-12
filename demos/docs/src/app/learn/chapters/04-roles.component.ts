import { Component } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ChapterComponent } from '../chapter.component';
import { LiveExampleComponent, LiveFrame } from '../live-example.component';
import { RefComponent } from '../ref.component';
import themeScss from '../../../examples/learn/04-roles/theme.scss' with { loader: 'text' };
import exampleHtml from '../../../examples/learn/04-roles/example.html' with { loader: 'text' };
import exampleScss from '../../../examples/learn/04-roles/example.scss' with { loader: 'text' };
import tryPaleTheme from '../../../examples/learn/04-roles/try-pale.theme.scss' with {
  loader: 'text',
};
import tryShadesTheme from '../../../examples/learn/04-roles/try-shades.theme.scss' with {
  loader: 'text',
};
import tryShadesScss from '../../../examples/learn/04-roles/try-shades.scss' with {
  loader: 'text',
};

@Component({
  selector: 'cpa-learn-roles',
  standalone: true,
  imports: [ChapterComponent, LiveExampleComponent, CodeComponent, RefComponent],
  template: `
    <cpa-chapter [n]="4">
      <div chapterExample>
        <p class="learn-lead">
          One small component, shown in three palettes. The heading names the palette. The other
          words name, by the last word of its variable, what colours each part. The button marked
          <em>contrast</em> is filled with the palette's colour and written in its contrast.
        </p>
        <cpa-live-example chapter="04-roles" [files]="files" [frames]="example" />
      </div>

      <div chapterIdea>
        <p>
          A palette gives you its colour and six steps, from darkest to lightest. Which of them is
          right for a border? You could choose by eye: the lightest step for the fill, a darker one
          for the border, the colour itself for text, white on the button. Picking a colour by how
          light it looks like this is choosing a <strong>shade</strong>. It works for the colour you
          were looking at. But a step is the colour made lighter or darker by a fixed amount, so
          what it looks like depends on where the colour starts. The lightest step of a deep violet
          is a pale violet. A yellow is nearly as light as a colour gets, so its lighter steps have
          no room left and stay a strong yellow: yellow text cannot be read on them, and white text
          cannot be read on the yellow. In dark mode a pale fill is the wrong thing altogether.
        </p>
        <p>
          So a palette also has <strong>roles</strong>: variables named after a job. Each is worked
          out so that it does that job whatever the colour and whatever the mode.
        </p>
        <ul>
          <li>
            <cpa-ref name="--color--{name}--bg" /> is a <strong>fill</strong>: a soft version of the
            colour to put behind content. It is pale in light mode and deep in dark mode. The text
            for it is <cpa-ref name="--color--{name}--bg--contrast" />.
          </li>
          <li>
            <cpa-ref name="--color--{name}--stroke" /> is a <strong>border</strong> or a dividing
            line: the colour kept in a middle range of lightness, so the line shows on a light fill
            and on a dark one.
          </li>
          <li>
            The palette's colour, <cpa-ref name="--color--{name}" />, counts as a role too: it is
            for the part that should be unmistakably this palette, such as the button here, with
            <cpa-ref name="--color--{name}--contrast" /> as the text on it.
          </li>
          <li>
            <cpa-ref name="--color--{name}--focus" /> is the <strong>focus ring</strong> shown
            around the control the keyboard is on. Each palette has its own. Its lightness is the
            opposite of the palette's and its hue is turned part of the way round the colour wheel,
            because a ring in the button's own colour would not show next to the button. (The
            example draws it on the buttons marked <em>focus</em> without the keyboard.)
          </li>
          <li>
            <cpa-ref name="--color--{name}--tint-N" />, with N from 1 to 5, is the colour made
            see-through, from faint to nearly solid. A tint is a wash over whatever is already
            there, for a hovered row or a selected item. The pill in the example is tint 2, a wash
            over the card's fill.
          </li>
        </ul>
        <p>
          Three of these are the soft background, border and focus ring of chapter 1, whose names
          end in bg, stroke and focus. A role has steps like a colour, each with its contrast: the
          card in chapter 2 was filled with the high step of bg, and its text was that step's
          contrast.
        </p>
        <p>
          This divides the work. The component decides the job of each part: this is a fill, that is
          a border. The theme decides which colour does the job, because every role is worked out
          from its palette's colour. A component written with roles goes on working when the
          palette, the theme or the mode changes; one written with shades works for the colour it
          was drawn with.
        </p>
      </div>

      <div chapterCode>
        <p>
          The component's stylesheet from the example. It is written once: Sass's
          <code>&#64;each</code> repeats the rule for each of the three palette names, putting the
          name where <code>#&#123;$name&#125;</code> is. The rules under "Layout only" set no
          colour.
        </p>
        <cpa-code [code]="files['example.scss']" lang="scss" />
      </div>

      <div chapterTry>
        <ul>
          <li>
            <strong>A pale primary.</strong> The theme passes a light yellow in place of the violet;
            the component's stylesheet is untouched. The fill is still a fill, the border still
            shows, and the text on the button has turned black. One role does less well here: the
            focus ring of a pale colour is nearly black, so in dark mode it is hard to see against
            the dark fill.
          </li>
          <li>
            <strong>Written with shades.</strong> The same pale theme, with the component written by
            eye the way the first paragraph describes: the lightest step for the fill, a darker step
            for the border and the focus ring, a lighter step for the pill, the colour for the text,
            white on the button. On the yellow the text in the colour and the white text cannot be
            read, and the pill cannot be seen: it is the same yellow as the fill. (The words in the
            boxes are unchanged, so they still name the roles, but this stylesheet no longer uses
            the role variables.)
          </li>
        </ul>
        <cpa-live-example chapter="04-roles" [files]="files" [frames]="tryIt" />
      </div>

      <span chapterNow>
        colour a component by the job of each part (fill, border, text, focus ring, wash) and expect
        it to hold in any palette, theme or mode.
      </span>
    </cpa-chapter>
  `,
})
export class RolesChapterComponent {
  protected readonly files: Record<string, string> = {
    'theme.scss': themeScss,
    'example.html': exampleHtml,
    'example.scss': exampleScss,
    'try-pale.theme.scss': tryPaleTheme,
    'try-shades.theme.scss': tryShadesTheme,
    'try-shades.scss': tryShadesScss,
  };

  protected readonly example: LiveFrame[] = [{ frame: 'example', label: 'Example' }];

  protected readonly tryIt: LiveFrame[] = [
    { frame: 'try-pale', label: 'A pale primary' },
    { frame: 'try-shades', label: 'Written with shades' },
  ];
}
