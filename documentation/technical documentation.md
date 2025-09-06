\# Technical Documentation for Lucid Math



This is the technical documentation for Lucid Math, a web browser extension that converts MathML into plaintext output.

&nbsp;

\## Organization

\- Source code is located in the /src directory.

\- Tests are in /src/tests.

\- Documentation is kept in its own directory.

\- Minimal HTML examples are provided in a dedicated directory.

\- These can be loaded once the extension is installed to see how it works.

\- Some examples are more detailed than others.

&nbsp;

\## Code Overview

\- convertMathML

The main dispatcher of the parser. Depending on the tag encountered, it calls the appropriate handler to produce the plaintext output.

\- preprocessMathML

Prepares the input string by replacing browser-encoded symbols (like <, >, etc.) so that convertMathML can parse correctly.

\- Handler functions

Each MathML tag is handled by a dedicated function, named using camelCase as handleX.

Example: handleMsqrt(node) converts an <msqrt> element.

Each handler takes a node (the MathML structure) as its argument.

\- Visual tags

Some tags are purely presentational and skipped during conversion because they add no value to plaintext output. These include:

&nbsp; - <mphantom>

&nbsp; - <mpad>

&nbsp; - <mstyle>

&nbsp;

\## Implementation Status

As of version 1.0, all tags from the \[MDN MathML element reference](https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element) have been implemented.

