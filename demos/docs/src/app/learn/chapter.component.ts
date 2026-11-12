import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TocService } from '../shell/toc.service';
import { CHAPTERS } from './chapters';

/**
 * The shape of every Learn chapter (PORT-PLAN.md, Phase 17). A chapter page
 * fills five parts and this component lays them out, always in this order:
 *
 *   the question         from CHAPTERS, under the title
 *   [chapterExample]     the live example, before anything is named
 *   [chapterIdea]        the idea in plain words
 *   [chapterCode]        the smallest code that produces what was shown
 *   [chapterTry]         a variation the reader switches in the live example
 *   [chapterNow]         "You can now …", the last line
 *
 * The order check (scripts/lib/order.ts) fails a page that leaves one out.
 * The styles are global (no encapsulation) and all under `.learn`, so they
 * reach the parts a page projects.
 */
@Component({
  selector: 'cpa-chapter',
  standalone: true,
  imports: [RouterLink],
  encapsulation: ViewEncapsulation.None,
  template: `
    <article class="learn">
      <header class="learn-header">
        <p class="learn-kicker">Learn · chapter {{ chapter().n }} of {{ total }}</p>
        <h1>{{ chapter().title }}</h1>
        <p class="learn-question">{{ chapter().question }}</p>
      </header>

      <section id="example" class="learn-part">
        <ng-content select="[chapterExample]" />
      </section>

      <section id="idea" class="learn-part learn-prose">
        <h2>The idea</h2>
        <ng-content select="[chapterIdea]" />
      </section>

      <section id="code" class="learn-part learn-prose">
        <h2>The code</h2>
        <ng-content select="[chapterCode]" />
      </section>

      <section id="try-it" class="learn-part learn-prose">
        <h2>Try it</h2>
        <ng-content select="[chapterTry]" />
      </section>

      <p class="learn-now"><strong>You can now</strong> <ng-content select="[chapterNow]" /></p>

      <nav class="learn-nav">
        @if (previous(); as p) {
          <a class="learn-nav-link" [routerLink]="'/learn/' + p.slug">
            <span class="learn-nav-dir">← Chapter {{ p.n }}</span>
            <span>{{ p.title }}</span>
          </a>
        } @else {
          <a class="learn-nav-link" routerLink="/learn">
            <span class="learn-nav-dir">←</span>
            <span>All chapters</span>
          </a>
        }
        @if (next(); as x) {
          @if (x.written) {
            <a class="learn-nav-link learn-nav-link--next" [routerLink]="'/learn/' + x.slug">
              <span class="learn-nav-dir">Chapter {{ x.n }} →</span>
              <span>{{ x.title }}</span>
            </a>
          } @else {
            <span class="learn-nav-link learn-nav-link--next learn-nav-link--off">
              <span class="learn-nav-dir">Chapter {{ x.n }}, not written yet</span>
              <span>{{ x.title }}</span>
            </span>
          }
        }
      </nav>
    </article>
  `,
  styles: [
    `
      .learn {
        max-width: 1040px;
      }

      .learn-header {
        margin-bottom: 28px;
      }

      .learn-kicker {
        margin: 0 0 10px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.6;
      }

      .learn-header h1 {
        margin: 0 0 12px;
        font-size: 40px;
        font-weight: 300;
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: var(--color--primary);
      }

      .learn-question {
        margin: 0;
        font-size: 21px;
        line-height: 1.4;
      }

      .learn-part {
        margin-bottom: 44px;
      }

      .learn-prose h2 {
        margin: 0 0 14px;
        font-size: 24px;
        font-weight: 400;
        color: var(--color--primary);
      }

      .learn-prose > p,
      .learn-prose > [chapterIdea] > p,
      .learn-prose p,
      .learn-lead {
        max-width: 700px;
        margin: 0 0 16px;
        font-size: 16px;
        line-height: 1.75;
      }

      .learn-prose ul {
        max-width: 680px;
        margin: 0 0 16px;
        padding-left: 22px;
        font-size: 16px;
        line-height: 1.75;
      }

      .learn-prose p.learn-chain {
        font-family: 'Roboto Mono', monospace;
        font-size: 14px;
      }

      .learn-prose li {
        margin-bottom: 6px;
      }

      .learn-prose cpa-code pre {
        max-width: 700px;
        max-height: 460px;
        margin: 0 0 18px;
        font-size: 13.5px;
      }

      .learn-now {
        max-width: 700px;
        margin: 0 0 48px;
        padding: 16px 20px;
        border-left: 4px solid var(--color--primary);
        background: var(--color--primary--tint-1);
        font-size: 16px;
        line-height: 1.7;
      }

      .learn-nav {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding-top: 24px;
        border-top: 1px solid var(--color--surface--stroke);
      }

      .learn-nav-link {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 12px 16px;
        border: 1px solid var(--color--surface--stroke);
        border-radius: 10px;
        text-decoration: none;
        font-size: 15px;
      }

      .learn-nav-link--next {
        margin-left: auto;
        text-align: right;
      }

      .learn-nav-link--off {
        opacity: 0.55;
      }

      .learn-nav-dir {
        font-size: 12px;
        opacity: 0.7;
      }

      a.learn-nav-link:hover {
        border-color: var(--color--primary--stroke);
        background: var(--color--surface--bg);
      }
    `,
  ],
})
export class ChapterComponent {
  /** The chapter's number in CHAPTERS. */
  readonly n = input.required<number>();

  protected readonly total = CHAPTERS.length;
  protected readonly chapter = computed(() => CHAPTERS[this.n() - 1]);
  protected readonly previous = computed(() => CHAPTERS[this.n() - 2]);
  protected readonly next = computed(() => CHAPTERS[this.n()]);

  constructor() {
    inject(TocService).set([]);
  }
}
