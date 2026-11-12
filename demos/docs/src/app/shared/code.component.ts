import { Component, ViewEncapsulation, computed, input } from '@angular/core';

/**
 * A code sample shown from a real file. Pages import the file as text
 * (`with { loader: 'text' }`) from `src/examples/{page}/` and pass it here, so
 * the text on the page is the text `demos/docs/test/examples.test.ts` checks.
 *
 * highlight.js picks the block up like any other `pre code` (see
 * PackagesLayoutComponent).
 */
@Component({
  selector: 'cpa-code',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `<pre><code [class]="'language-' + lang()" [textContent]="text()"></code></pre>`,
  styles: [
    `
      cpa-code {
        display: block;
      }
    `,
  ],
})
export class CodeComponent {
  /** The file's text, as imported. */
  readonly code = input.required<string>();
  /** highlight.js language: scss, css, html, … */
  readonly lang = input<string>('scss');

  protected readonly text = computed(() => this.code().trimEnd());
}
