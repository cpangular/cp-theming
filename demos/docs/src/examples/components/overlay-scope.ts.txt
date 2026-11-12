import { Directive, ElementRef, Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * An overlay container that carries the theme and the mode of the element it
 * is provided on.
 *
 * Angular Material renders a menu, a datepicker, a tooltip, a dialog, a bottom
 * sheet and a snackbar into the overlay container, a `<div>` under `<body>`:
 * outside the element that opened them, so outside its `theme` and `themeMode`.
 * This container copies both onto itself each time an overlay is created, and
 * everything rendered into it resolves the adapter's tokens there.
 */
@Injectable()
export class ScopedOverlayContainer extends OverlayContainer {
  private readonly _scope = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  override getContainerElement(): HTMLElement {
    const container = super.getContainerElement();
    const theme = this._scope.closest('[theme]')?.getAttribute('theme');
    // The mode the scope resolves to, not its attribute: "invert" on a
    // container under <body> would invert the page's mode instead.
    const scheme = getComputedStyle(this._scope).colorScheme;
    const mode = scheme === 'light' || scheme === 'dark' ? scheme : null;
    if (theme) container.setAttribute('theme', theme);
    else container.removeAttribute('theme');
    if (mode) container.setAttribute('themeMode', mode);
    else container.removeAttribute('themeMode');
    return container;
  }
}

/**
 * Overlays opened from inside this element follow its theme and mode.
 *
 * Menu, datepicker and tooltip take the overlay container from the injector of
 * the element they are on. Dialog, bottom sheet and snackbar are services, and
 * use the injector that provides the service: so the services are provided
 * here too, and a component inside the scope injects these instances.
 */
@Directive({
  selector: '[cpaOverlayScope]',
  standalone: true,
  providers: [
    { provide: OverlayContainer, useClass: ScopedOverlayContainer },
    Dialog,
    MatDialog,
    MatBottomSheet,
    MatSnackBar,
  ],
})
export class OverlayScopeDirective {}
