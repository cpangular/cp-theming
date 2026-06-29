import { Component, Input, OnChanges, OnDestroy, inject, effect } from '@angular/core';
import { TocService } from './toc.service';

@Component({
  selector: 'cpa-toc',
  standalone: true,
  template: `
    @if (toc.entries().length > 1) {
      <nav class="toc">
        <span class="toc-title">On this page</span>
        <ul class="toc-list">
          @for (entry of toc.entries(); track entry.anchor) {
            <li>
              <a
                class="toc-link"
                [href]="'#' + entry.anchor"
                [class.toc-link--active]="toc.activeAnchor() === entry.anchor"
                (click)="$event.preventDefault(); scrollTo(entry.anchor)"
                >{{ entry.label }}</a
              >
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styles: [
    `
      .toc {
        padding: 0;
      }

      .toc-title {
        display: block;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color--primary);
        opacity: 0.7;
        margin-bottom: 12px;
      }

      .toc-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .toc-list li {
        margin-bottom: 2px;
      }

      .toc-link {
        display: block;
        font-size: 13px;
        line-height: 1.5;
        padding: 4px 8px;
        border-radius: 4px;
        color: var(--color--surface--contrast);
        text-decoration: none;
        opacity: 0.7;
        transition:
          opacity 0.15s,
          background 0.15s;
        border-left: 2px solid transparent;
      }

      .toc-link:hover {
        opacity: 1;
        background: var(--color--primary--tint-1);
      }

      .toc-link--active {
        opacity: 1;
        color: var(--color--primary);
        border-left-color: var(--color--primary);
      }
    `,
  ],
})
export class TableOfContentsComponent implements OnChanges, OnDestroy {
  readonly toc = inject(TocService);

  @Input() scrollEl: HTMLElement | null = null;

  private readonly _scrollListener = () => this._updateActive();

  constructor() {
    // When entries change (new page), reset scroll tracking
    effect(() => {
      const entries = this.toc.entries();
      if (entries.length) {
        // slight delay to let the DOM render the new page content
        setTimeout(() => this._updateActive(), 50);
      }
    });
  }

  ngOnChanges(): void {
    // Re-attach listener when scroll element changes
    this.scrollEl?.addEventListener('scroll', this._scrollListener, { passive: true });
  }

  ngOnDestroy(): void {
    this.scrollEl?.removeEventListener('scroll', this._scrollListener);
  }

  scrollTo(anchor: string): void {
    const el = document.getElementById(anchor);
    if (el && this.scrollEl) {
      const elTop = el.getBoundingClientRect().top;
      const containerTop = this.scrollEl.getBoundingClientRect().top;
      this.scrollEl.scrollBy({ top: elTop - containerTop - 24, behavior: 'smooth' });
    }
  }

  private _updateActive(): void {
    const entries = this.toc.entries();
    if (!entries.length || !this.scrollEl) return;

    const containerTop = this.scrollEl.getBoundingClientRect().top;
    let active = entries[0].anchor;

    for (const entry of entries) {
      const el = document.getElementById(entry.anchor);
      if (el) {
        const top = el.getBoundingClientRect().top - containerTop;
        if (top <= 80) {
          active = entry.anchor;
        }
      }
    }
    this.toc.markActive(active);
  }
}
