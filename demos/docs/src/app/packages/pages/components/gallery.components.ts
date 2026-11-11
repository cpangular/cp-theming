// The Components page's live examples (PORT-PLAN.md, Phase 15). Each component
// here renders one template from src/examples/components/ and holds only what
// that template needs to run; the page shows the same file as text, and
// demos/docs/test/examples.test.ts checks it. No component here has styles of
// its own: gallery-layout.scss is layout only, so every colour on the page is
// the adapter's.
import { Component, Type, effect, inject, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { OverlayScopeDirective } from '../../../shared/overlay-scope.directive';

import accentSrc from '../../../../examples/components/accent.ng.html' with { loader: 'text' };
import badgeSrc from '../../../../examples/components/badge.ng.html' with { loader: 'text' };
import bottomSheetContentSrc from '../../../../examples/components/bottom-sheet-content.ng.html' with {
  loader: 'text',
};
import bottomSheetSrc from '../../../../examples/components/bottom-sheet.ng.html' with {
  loader: 'text',
};
import buttonsSrc from '../../../../examples/components/buttons.ng.html' with { loader: 'text' };
import cardSrc from '../../../../examples/components/card.ng.html' with { loader: 'text' };
import checkboxSrc from '../../../../examples/components/checkbox.ng.html' with { loader: 'text' };
import chipsSrc from '../../../../examples/components/chips.ng.html' with { loader: 'text' };
import datepickerSrc from '../../../../examples/components/datepicker.ng.html' with {
  loader: 'text',
};
import dialogContentSrc from '../../../../examples/components/dialog-content.ng.html' with {
  loader: 'text',
};
import dialogSrc from '../../../../examples/components/dialog.ng.html' with { loader: 'text' };
import dividerSrc from '../../../../examples/components/divider.ng.html' with { loader: 'text' };
import expansionSrc from '../../../../examples/components/expansion.ng.html' with {
  loader: 'text',
};
import formFieldSrc from '../../../../examples/components/form-field.ng.html' with {
  loader: 'text',
};
import gridListSrc from '../../../../examples/components/grid-list.ng.html' with { loader: 'text' };
import listSrc from '../../../../examples/components/list.ng.html' with { loader: 'text' };
import menuSrc from '../../../../examples/components/menu.ng.html' with { loader: 'text' };
import overlayModeSrc from '../../../../examples/components/overlay-mode.ng.html' with {
  loader: 'text',
};
import overlayPanelSrc from '../../../../examples/components/overlay-panel.ng.html' with {
  loader: 'text',
};
import overlayThemeSrc from '../../../../examples/components/overlay-theme.ng.html' with {
  loader: 'text',
};
import overlaysSrc from '../../../../examples/components/overlays.ng.html' with { loader: 'text' };
import progressSrc from '../../../../examples/components/progress.ng.html' with { loader: 'text' };
import radioSrc from '../../../../examples/components/radio.ng.html' with { loader: 'text' };
import rippleSrc from '../../../../examples/components/ripple.ng.html' with { loader: 'text' };
import selectSrc from '../../../../examples/components/select.ng.html' with { loader: 'text' };
import sidenavSrc from '../../../../examples/components/sidenav.ng.html' with { loader: 'text' };
import slideToggleSrc from '../../../../examples/components/slide-toggle.ng.html' with {
  loader: 'text',
};
import sliderSrc from '../../../../examples/components/slider.ng.html' with { loader: 'text' };
import snackbarSrc from '../../../../examples/components/snackbar.ng.html' with { loader: 'text' };
import stepperSrc from '../../../../examples/components/stepper.ng.html' with { loader: 'text' };
import tableSrc from '../../../../examples/components/table.ng.html' with { loader: 'text' };
import tabsSrc from '../../../../examples/components/tabs.ng.html' with { loader: 'text' };
import tooltipSrc from '../../../../examples/components/tooltip.ng.html' with { loader: 'text' };
import treeSrc from '../../../../examples/components/tree.ng.html' with { loader: 'text' };

const LAYOUT = './gallery-layout.scss';

/** A fixed date, so the calendars show the same month every day. */
const DATE = new Date(2026, 5, 15);

// ── Buttons, selection controls, fields ──────────────────────────────────────

@Component({
  selector: 'cpa-g-accent',
  imports: [MatButtonModule, MatCheckboxModule, MatSlideToggleModule],
  templateUrl: '../../../../examples/components/accent.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryAccent {}

@Component({
  selector: 'cpa-g-buttons',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule],
  templateUrl: '../../../../examples/components/buttons.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryButtons {}

@Component({
  selector: 'cpa-g-chips',
  imports: [MatChipsModule, MatFormFieldModule, MatIconModule],
  templateUrl: '../../../../examples/components/chips.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryChips {}

@Component({
  selector: 'cpa-g-form-field',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule],
  templateUrl: '../../../../examples/components/form-field.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryFormField {
  readonly email = new FormControl('not an address', [Validators.email]);

  constructor() {
    this.email.markAsTouched();
  }
}

@Component({
  selector: 'cpa-g-select',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule],
  templateUrl: '../../../../examples/components/select.ng.html',
  styleUrl: LAYOUT,
})
export class GallerySelect {}

@Component({
  selector: 'cpa-g-checkbox',
  imports: [MatCheckboxModule],
  templateUrl: '../../../../examples/components/checkbox.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryCheckbox {}

@Component({
  selector: 'cpa-g-radio',
  imports: [MatRadioModule],
  templateUrl: '../../../../examples/components/radio.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryRadio {}

@Component({
  selector: 'cpa-g-slide-toggle',
  imports: [MatSlideToggleModule],
  templateUrl: '../../../../examples/components/slide-toggle.ng.html',
  styleUrl: LAYOUT,
})
export class GallerySlideToggle {}

@Component({
  selector: 'cpa-g-slider',
  imports: [MatSliderModule],
  templateUrl: '../../../../examples/components/slider.ng.html',
  styleUrl: LAYOUT,
})
export class GallerySlider {}

@Component({
  selector: 'cpa-g-datepicker',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
  templateUrl: '../../../../examples/components/datepicker.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryDatepicker {
  readonly date = DATE;
  readonly start = new FormControl(new Date(2026, 5, 8));
  readonly end = new FormControl(new Date(2026, 5, 19));
}

// ── Containers and navigation ────────────────────────────────────────────────

@Component({
  selector: 'cpa-g-tabs',
  imports: [MatTabsModule],
  templateUrl: '../../../../examples/components/tabs.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryTabs {}

@Component({
  selector: 'cpa-g-card',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: '../../../../examples/components/card.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryCard {}

@Component({
  selector: 'cpa-g-list',
  imports: [MatListModule, MatIconModule],
  templateUrl: '../../../../examples/components/list.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryList {}

@Component({
  selector: 'cpa-g-expansion',
  imports: [MatExpansionModule, MatButtonModule],
  templateUrl: '../../../../examples/components/expansion.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryExpansion {}

@Component({
  selector: 'cpa-g-stepper',
  imports: [MatStepperModule, MatButtonModule],
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }],
  templateUrl: '../../../../examples/components/stepper.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryStepper {}

@Component({
  selector: 'cpa-g-sidenav',
  imports: [MatSidenavModule, MatToolbarModule, MatListModule, MatButtonModule, MatIconModule],
  templateUrl: '../../../../examples/components/sidenav.ng.html',
  styleUrl: LAYOUT,
})
export class GallerySidenav {}

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

@Component({
  selector: 'cpa-g-tree',
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: '../../../../examples/components/tree.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryTree {
  readonly nodes: TreeNode[] = [
    { name: 'Fruit', children: [{ name: 'Apple' }, { name: 'Pear' }] },
    { name: 'Vegetables', children: [{ name: 'Leek' }] },
    { name: 'Bread' },
  ];
  readonly children = (node: TreeNode): TreeNode[] => node.children ?? [];
  readonly hasChildren = (_: number, node: TreeNode): boolean => !!node.children?.length;
}

@Component({
  selector: 'cpa-g-grid-list',
  imports: [MatGridListModule],
  templateUrl: '../../../../examples/components/grid-list.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryGridList {}

@Component({
  selector: 'cpa-g-divider',
  imports: [MatDividerModule, MatListModule],
  templateUrl: '../../../../examples/components/divider.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryDivider {}

@Component({
  selector: 'cpa-g-ripple',
  imports: [MatRippleModule],
  templateUrl: '../../../../examples/components/ripple.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryRipple {}

// ── Data ─────────────────────────────────────────────────────────────────────

interface Row {
  name: string;
  symbol: string;
  weight: number;
}

const ROWS: Row[] = [
  { name: 'Hydrogen', symbol: 'H', weight: 1.008 },
  { name: 'Helium', symbol: 'He', weight: 4.0026 },
  { name: 'Lithium', symbol: 'Li', weight: 6.94 },
  { name: 'Beryllium', symbol: 'Be', weight: 9.0122 },
  { name: 'Boron', symbol: 'B', weight: 10.81 },
  { name: 'Carbon', symbol: 'C', weight: 12.011 },
];

@Component({
  selector: 'cpa-g-table',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule],
  templateUrl: '../../../../examples/components/table.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryTable {
  readonly columns = ['name', 'symbol', 'weight'];
  readonly rows = new MatTableDataSource(ROWS);
  private readonly _sort = viewChild(MatSort);
  private readonly _paginator = viewChild(MatPaginator);

  constructor() {
    effect(() => {
      this.rows.sort = this._sort() ?? null;
      this.rows.paginator = this._paginator() ?? null;
    });
  }
}

@Component({
  selector: 'cpa-g-badge',
  imports: [MatBadgeModule, MatButtonModule, MatIconModule],
  templateUrl: '../../../../examples/components/badge.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryBadge {}

@Component({
  selector: 'cpa-g-progress',
  imports: [MatProgressBarModule, MatProgressSpinnerModule],
  templateUrl: '../../../../examples/components/progress.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryProgress {}

// ── Overlays ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'cpa-g-menu',
  imports: [MatMenuModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: '../../../../examples/components/menu.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryMenu {}

@Component({
  selector: 'cpa-g-dialog-content',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: '../../../../examples/components/dialog-content.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryDialogContent {}

@Component({
  selector: 'cpa-g-dialog',
  imports: [MatButtonModule],
  templateUrl: '../../../../examples/components/dialog.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryDialog {
  private readonly _dialog = inject(MatDialog);

  open(): void {
    this._dialog.open(GalleryDialogContent);
  }
}

@Component({
  selector: 'cpa-g-bottom-sheet-content',
  imports: [MatListModule, MatIconModule],
  templateUrl: '../../../../examples/components/bottom-sheet-content.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryBottomSheetContent {
  private readonly _ref = inject<MatBottomSheetRef<GalleryBottomSheetContent>>(MatBottomSheetRef);

  close(): void {
    this._ref.dismiss();
  }
}

@Component({
  selector: 'cpa-g-bottom-sheet',
  imports: [MatButtonModule],
  templateUrl: '../../../../examples/components/bottom-sheet.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryBottomSheet {
  private readonly _bottomSheet = inject(MatBottomSheet);

  open(): void {
    this._bottomSheet.open(GalleryBottomSheetContent);
  }
}

@Component({
  selector: 'cpa-g-snackbar',
  imports: [MatButtonModule],
  templateUrl: '../../../../examples/components/snackbar.ng.html',
  styleUrl: LAYOUT,
})
export class GallerySnackbar {
  private readonly _snackBar = inject(MatSnackBar);

  show(): void {
    this._snackBar.open('Draft discarded', 'Undo', { duration: 6000 });
  }
}

@Component({
  selector: 'cpa-g-tooltip',
  imports: [MatTooltipModule, MatButtonModule, MatIconModule],
  templateUrl: '../../../../examples/components/tooltip.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryTooltip {}

/**
 * The eight overlays, opened from wherever this component is. It injects the
 * three services the ordinary way; inside a `cpaOverlayScope` those are the
 * scope's instances.
 */
@Component({
  selector: 'cpa-g-overlays',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: '../../../../examples/components/overlays.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryOverlays {
  private readonly _dialog = inject(MatDialog);
  private readonly _bottomSheet = inject(MatBottomSheet);
  private readonly _snackBar = inject(MatSnackBar);
  readonly date = DATE;

  openDialog(): void {
    this._dialog.open(GalleryDialogContent);
  }

  openBottomSheet(): void {
    this._bottomSheet.open(GalleryBottomSheetContent);
  }

  showSnackbar(): void {
    this._snackBar.open('Draft discarded', 'Undo', { duration: 6000 });
  }
}

@Component({
  selector: 'cpa-g-overlay-theme',
  imports: [GalleryOverlays, OverlayScopeDirective],
  templateUrl: '../../../../examples/components/overlay-theme.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryOverlayTheme {}

@Component({
  selector: 'cpa-g-overlay-mode',
  imports: [GalleryOverlays, OverlayScopeDirective],
  templateUrl: '../../../../examples/components/overlay-mode.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryOverlayMode {}

@Component({
  selector: 'cpa-g-overlay-panel',
  imports: [MatButtonModule],
  templateUrl: '../../../../examples/components/overlay-panel.ng.html',
  styleUrl: LAYOUT,
})
export class GalleryOverlayPanel {
  private readonly _dialog = inject(MatDialog);

  open(scope: HTMLElement): void {
    this._dialog.open(GalleryDialogContent, { panelClass: 'cpa-scoped-panel' });
    // The pane exists as soon as open() returns. Material's panel class is a
    // class; the adapter selects on the theme attribute, so set that.
    document
      .querySelector('.cpa-scoped-panel')
      ?.setAttribute('theme', scope.getAttribute('theme') ?? '');
  }
}

// ── The page's list ──────────────────────────────────────────────────────────

export interface GallerySource {
  file: string;
  text: string;
}

export interface GalleryFamily {
  id: string;
  title: string;
  /** What the section shows. */
  text: string;
  component: Type<unknown>;
  sources: GallerySource[];
  /** Reads the primary roles: repeated under each accent palette. */
  accent?: boolean;
}

const source = (file: string, text: string): GallerySource => ({ file, text });

export const ACCENT_EXAMPLE = { component: GalleryAccent, source: accentSrc };

export const FAMILIES: GalleryFamily[] = [
  {
    id: 'buttons',
    title: 'Buttons',
    text: 'The five variants, each enabled and disabled; with an icon; icon button; FAB, mini FAB and extended FAB; a toggle group with a selected and a disabled toggle.',
    component: GalleryButtons,
    sources: [source('buttons.ng.html', buttonsSrc)],
    accent: true,
  },
  {
    id: 'chips',
    title: 'Chips',
    text: 'Plain chips, filter chips (selected, unselected, disabled) and input chips inside a form field.',
    component: GalleryChips,
    sources: [source('chips.ng.html', chipsSrc)],
  },
  {
    id: 'form-field',
    title: 'Form field',
    text: 'Filled and outlined: label and hint, prefix and suffix icons with a placeholder, the error state, disabled, and a textarea.',
    component: GalleryFormField,
    sources: [source('form-field.ng.html', formFieldSrc)],
    accent: true,
  },
  {
    id: 'select',
    title: 'Select and autocomplete',
    text: 'A select with a value, a multiple select, a disabled one, and an autocomplete. Their panels open beside the field.',
    component: GallerySelect,
    sources: [source('select.ng.html', selectSrc)],
    accent: true,
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    text: 'Unchecked, checked, indeterminate, and disabled in both states.',
    component: GalleryCheckbox,
    sources: [source('checkbox.ng.html', checkboxSrc)],
    accent: true,
  },
  {
    id: 'radio',
    title: 'Radio',
    text: 'Unselected, selected, disabled, and a disabled group with a selection.',
    component: GalleryRadio,
    sources: [source('radio.ng.html', radioSrc)],
    accent: true,
  },
  {
    id: 'slide-toggle',
    title: 'Slide toggle',
    text: 'Off, on, on without the icon, and disabled in both states.',
    component: GallerySlideToggle,
    sources: [source('slide-toggle.ng.html', slideToggleSrc)],
    accent: true,
  },
  {
    id: 'slider',
    title: 'Slider',
    text: 'A single value, a range, a discrete slider with tick marks, and a disabled one.',
    component: GallerySlider,
    sources: [source('slider.ng.html', sliderSrc)],
    accent: true,
  },
  {
    id: 'datepicker',
    title: 'Datepicker',
    text: 'A date field, a date range field, and the calendar the picker opens, shown inline with a selected date.',
    component: GalleryDatepicker,
    sources: [source('datepicker.ng.html', datepickerSrc)],
    accent: true,
  },
  {
    id: 'tabs',
    title: 'Tabs',
    text: 'A selected tab, an unselected one and a disabled one.',
    component: GalleryTabs,
    sources: [source('tabs.ng.html', tabsSrc)],
    accent: true,
  },
  {
    id: 'card',
    title: 'Card',
    text: 'Elevated, outlined and filled.',
    component: GalleryCard,
    sources: [source('card.ng.html', cardSrc)],
  },
  {
    id: 'list',
    title: 'List and selection list',
    text: 'A list with icons and two lines, an action list, a navigation list with an activated item, and selection lists with multiple and single selection.',
    component: GalleryList,
    sources: [source('list.ng.html', listSrc)],
    accent: true,
  },
  {
    id: 'menu',
    title: 'Menu',
    text: 'Items with icons, a disabled item, a divider and a submenu.',
    component: GalleryMenu,
    sources: [source('menu.ng.html', menuSrc)],
  },
  {
    id: 'dialog',
    title: 'Dialog',
    text: 'A title, content and two actions.',
    component: GalleryDialog,
    sources: [
      source('dialog.ng.html', dialogSrc),
      source('dialog-content.ng.html', dialogContentSrc),
    ],
  },
  {
    id: 'bottom-sheet',
    title: 'Bottom sheet',
    text: 'An action list in a sheet.',
    component: GalleryBottomSheet,
    sources: [
      source('bottom-sheet.ng.html', bottomSheetSrc),
      source('bottom-sheet-content.ng.html', bottomSheetContentSrc),
    ],
  },
  {
    id: 'snackbar',
    title: 'Snackbar',
    text: 'A message with an action.',
    component: GallerySnackbar,
    sources: [source('snackbar.ng.html', snackbarSrc)],
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    text: 'On a button and on an icon button.',
    component: GalleryTooltip,
    sources: [source('tooltip.ng.html', tooltipSrc)],
  },
  {
    id: 'badge',
    title: 'Badge',
    text: 'Over an icon and a button, beside text; small, large and disabled.',
    component: GalleryBadge,
    sources: [source('badge.ng.html', badgeSrc)],
  },
  {
    id: 'progress',
    title: 'Progress bar and spinner',
    text: 'Determinate, buffer and indeterminate bars; a determinate and an indeterminate spinner.',
    component: GalleryProgress,
    sources: [source('progress.ng.html', progressSrc)],
    accent: true,
  },
  {
    id: 'table',
    title: 'Table',
    text: 'Sortable headers with one column sorted, and a paginator.',
    component: GalleryTable,
    sources: [source('table.ng.html', tableSrc)],
  },
  {
    id: 'expansion',
    title: 'Expansion panel',
    text: 'An accordion with an expanded panel, a collapsed one and a disabled one.',
    component: GalleryExpansion,
    sources: [source('expansion.ng.html', expansionSrc)],
  },
  {
    id: 'stepper',
    title: 'Stepper',
    text: 'A completed step, the current one, an optional one and one with an error.',
    component: GalleryStepper,
    sources: [source('stepper.ng.html', stepperSrc)],
    accent: true,
  },
  {
    id: 'sidenav',
    title: 'Sidenav and toolbar',
    text: 'A toolbar over a container with an open side-mode sidenav.',
    component: GallerySidenav,
    sources: [source('sidenav.ng.html', sidenavSrc)],
  },
  {
    id: 'tree',
    title: 'Tree',
    text: 'An expanded node, a collapsed one and a leaf.',
    component: GalleryTree,
    sources: [source('tree.ng.html', treeSrc)],
  },
  {
    id: 'grid-list',
    title: 'Grid list',
    text: 'Tiles that span columns and rows, with a header and a footer.',
    component: GalleryGridList,
    sources: [source('grid-list.ng.html', gridListSrc)],
  },
  {
    id: 'divider',
    title: 'Divider',
    text: 'Horizontal, inset and vertical.',
    component: GalleryDivider,
    sources: [source('divider.ng.html', dividerSrc)],
  },
  {
    id: 'ripple',
    title: 'Ripple',
    text: 'On a plain element: from the pointer, centred, and disabled.',
    component: GalleryRipple,
    sources: [source('ripple.ng.html', rippleSrc)],
  },
];

export interface OverlayScope {
  /** The value render.ts finds the demo by. */
  scope: string;
  title: string;
  text: string;
  component: Type<unknown>;
  sources: GallerySource[];
}

export const OVERLAY_SCOPES: OverlayScope[] = [
  {
    scope: 'page',
    title: 'In the page theme',
    text: 'Nothing to do: the overlay container is under <body>, and inherits the theme and the mode on <html>.',
    component: GalleryOverlays,
    sources: [source('overlays.ng.html', overlaysSrc)],
  },
  {
    scope: 'theme',
    title: 'In a nested theme',
    text: 'The eight overlays again, opened from inside another theme.',
    component: GalleryOverlayTheme,
    sources: [source('overlay-theme.ng.html', overlayThemeSrc)],
  },
  {
    scope: 'mode',
    title: 'In a nested themeMode',
    text: 'And from inside the opposite mode.',
    component: GalleryOverlayMode,
    sources: [source('overlay-mode.ng.html', overlayModeSrc)],
  },
  {
    scope: 'panel',
    title: 'One overlay, through its panel class',
    text: 'Without a scoped container: the theme attribute is set on the dialog panel.',
    component: GalleryOverlayPanel,
    sources: [source('overlay-panel.ng.html', overlayPanelSrc)],
  },
];
