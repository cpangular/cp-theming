// The docs examples are real files under src/examples/, imported as text:
//   import basic from '../../../examples/theme/basic.scss' with { loader: 'text' };
// @angular/build's loader attribute turns the file into a string at build time;
// these declarations give that string its type. A .scss imported this way is
// never compiled into the app: demos/docs/test/examples.test.ts compiles it.
declare module '*.scss' {
  const text: string;
  export default text;
}
declare module '*.css' {
  const text: string;
  export default text;
}
declare module '*.html' {
  const text: string;
  export default text;
}
