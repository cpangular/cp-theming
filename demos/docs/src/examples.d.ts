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
// TypeScript the docs app runs, shown as it is: a .ts.txt holds the text, and
// examples.test.ts fails unless that text is in a source file under src/app.
declare module '*.ts.txt' {
  const text: string;
  export default text;
}
