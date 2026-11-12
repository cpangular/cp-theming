// The shape of the data behind the Reference's CSS Variables page. The data
// itself is generated from the compiled core.css by the docs build
// (scripts/variables.ts → .generated/variables.ts); nothing on that page is a
// list kept by hand.
//
// Read by the Angular app and, as it is, by Node: keep it free of imports and
// of non-erasable syntax.

/** A colour token that can be a fill, and the token for text on it, if it has one. */
export interface ColourToken {
  name: string;
  /** How its swatch is labelled: `dark`, `tint-2`, `light value`. */
  label: string;
  /** `--…--contrast`: black or white, whichever reads on this colour. */
  contrast?: string;
}

/** One role of a palette: the colour itself, its bg or its stroke. */
export interface RoleGroup {
  /** `colour`, `bg` or `stroke`. */
  role: string;
  /** The role's own token: `--color--primary--bg`. */
  base: ColourToken;
  /** The light and the dark value a theme sets: `--…--mode-light`, `--…--mode-dark`. */
  inputs: ColourToken[];
  /** darkest … lightest: steps in a fixed direction. */
  fixed: ColourToken[];
  /** lowest … highest: steps that follow the mode. */
  relative: ColourToken[];
}

export interface PaletteGroup {
  name: string;
  /** Core works its colour out when a theme leaves it out (the chain palettes). */
  generated: boolean;
  roles: RoleGroup[];
  /** The focus ring colour, then its light and dark value. */
  focus: ColourToken[];
  tints: ColourToken[];
}

/** One non-colour variable. */
export interface VariableRow {
  name: string;
  /** The syntax it is registered with (`<length>`), when it is registered. */
  type?: string;
  /** What core gives it: its registered initial value or its declaration. */
  value: string;
  /** Kept per mode: the names of its light and its dark value. */
  pair?: [light: string, dark: string];
  /** The selectors that declare it, when it is not a default of the whole page. */
  where?: string[];
  /** Read by core with a fallback and never declared: yours to set. */
  input?: boolean;
  note?: string;
}

export interface VariableTable {
  /** Section id on the page: `space-vars`. */
  id: string;
  rows: VariableRow[];
}

/** The type scale: one row per text style, one column per property. */
export interface TypeScale {
  properties: string[];
  styles: { style: string; values: Record<string, string> }[];
}

export interface VariablesData {
  palettes: PaletteGroup[];
  tables: VariableTable[];
  typeScale: TypeScale;
  /** Colour tokens on the page, one swatch each. */
  colourTokens: number;
  /** Rows in the tables and the type scale. */
  otherVariables: number;
}
