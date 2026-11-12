import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REFS } from './chapters';

/**
 * A function, variable or attribute of the library, named in a Learn chapter:
 * `<cpa-ref name="t.palette()" />`, or `<cpa-ref name="theme" value="ocean" />`
 * for an attribute with a value. It renders the name as code, linked to its
 * Reference entry. The names and their targets are REFS in chapters.ts; the
 * order check fails a name a chapter has not introduced yet, and a `<code>`
 * that names a library entry without going through here.
 */
@Component({
  selector: 'cpa-ref',
  standalone: true,
  imports: [RouterLink],
  encapsulation: ViewEncapsulation.None,
  // One element and no whitespace around it: the link sits in a sentence.
  template: `<a class="learn-ref" [routerLink]="link()" [fragment]="ref()?.anchor" title="Reference"
    ><code>{{ text() }}</code></a
  >`,
  styles: [
    `
      cpa-ref {
        display: inline;
      }
      .learn-ref {
        text-decoration: none;
      }
      .learn-ref code {
        text-decoration: underline dotted;
        text-underline-offset: 3px;
      }
      .learn-ref:hover code {
        text-decoration-style: solid;
      }
    `,
  ],
})
export class RefComponent {
  readonly name = input.required<string>();
  /** For an attribute: the value to show with it, as in `theme="ocean"`. */
  readonly value = input<string>();

  protected readonly ref = computed(() => REFS.find((r) => r.name === this.name()));
  protected readonly link = computed(() => `/packages/${this.ref()?.page ?? 'core'}`);
  protected readonly text = computed(() =>
    this.value() === undefined ? this.name() : `${this.name()}="${this.value()}"`,
  );
}
