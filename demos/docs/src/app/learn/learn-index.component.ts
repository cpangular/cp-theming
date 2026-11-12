import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CHAPTERS } from './chapters';

/** The Learn track's first page: what it is, and the chapters in order. */
@Component({
  selector: 'cpa-learn-index',
  standalone: true,
  imports: [RouterLink],
  encapsulation: ViewEncapsulation.None,
  template: `
    <article class="learn learn-index">
      <header class="learn-header">
        <p class="learn-kicker">Learn</p>
        <h1>Learn cp-theming</h1>
        <p class="learn-question">
          Ten short chapters, read in order. Each one answers a question, and starts by showing the
          answer working.
        </p>
      </header>

      <section class="learn-part learn-prose">
        <p>
          You need to know CSS, including custom properties (<code>var()</code>). You do not need to
          have seen cp-theming, a design system or a colour theory book. A chapter uses only what
          the chapters before it explained, so start at the first one.
        </p>
        <p>
          Every chapter has the same parts: a running example, the idea behind it in plain words,
          the smallest code that produces it, something to change, and one line on what you can now
          do. When you want every option of a function or the full list of variables, each name in a
          chapter links to its entry in the <a routerLink="/packages/core">Reference</a>.
        </p>
      </section>

      <ol class="learn-list">
        @for (c of chapters; track c.n) {
          <li>
            @if (c.written) {
              <a class="learn-item" [routerLink]="'/learn/' + c.slug">
                <span class="learn-item-n">{{ c.n }}</span>
                <span class="learn-item-body">
                  <span class="learn-item-title">{{ c.title }}</span>
                  <span class="learn-item-q">{{ c.question }}</span>
                </span>
              </a>
            } @else {
              <span class="learn-item learn-item--off">
                <span class="learn-item-n">{{ c.n }}</span>
                <span class="learn-item-body">
                  <span class="learn-item-title">{{ c.title }}</span>
                  <span class="learn-item-q">{{ c.question }} Not written yet.</span>
                </span>
              </span>
            }
          </li>
        }
      </ol>

      <section class="learn-part learn-prose">
        <h2>How the examples run</h2>
        <p>
          Each example is a small web page of its own, shown inside the chapter. It is made of the
          files printed next to it and nothing else: a stylesheet for the theme, the example's own
          stylesheet and its HTML. The site's styles do not reach it, so what you read is what runs.
          The one thing the site adds is its light or dark setting (the button at the top right), so
          the example matches the page around it.
        </p>
      </section>
    </article>
  `,
  styles: [
    `
      .learn-list {
        list-style: none;
        max-width: 760px;
        margin: 0 0 44px;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .learn-item {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        padding: 16px 18px;
        border: 1px solid var(--color--surface--stroke--low);
        border-radius: 12px;
        background: var(--color--surface--bg);
        color: inherit;
        text-decoration: none;
      }

      a.learn-item:hover {
        border-color: var(--color--primary--stroke);
        background: var(--color--surface--bg--high);
      }

      .learn-item--off {
        opacity: 0.55;
        background: none;
      }

      .learn-item-n {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        background: var(--color--primary--tint-2);
        color: var(--color--primary);
      }

      .learn-item-body {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .learn-item-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--color--primary);
      }

      .learn-item-q {
        font-size: 14.5px;
        line-height: 1.5;
      }
    `,
  ],
})
export class LearnIndexComponent {
  protected readonly chapters = CHAPTERS;
}
