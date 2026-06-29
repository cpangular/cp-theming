import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

export interface TocEntry {
  label: string;
  anchor: string;
}

@Injectable({ providedIn: 'root' })
export class TocService {
  readonly entries = signal<TocEntry[]>([]);
  readonly activeAnchor = signal<string | null>(null);

  constructor() {
    // Root service lives for app lifetime — no cleanup needed
    inject(Router).events.subscribe((e) => {
      if (e instanceof NavigationStart) this.clear();
    });
  }

  set(entries: TocEntry[]): void {
    this.entries.set(entries);
    this.activeAnchor.set(entries[0]?.anchor ?? null);
  }

  clear(): void {
    this.entries.set([]);
    this.activeAnchor.set(null);
  }

  markActive(anchor: string): void {
    this.activeAnchor.set(anchor);
  }
}
