import {convertMathML} from "./converter.js";

// A helper to parse MathML strings
function parseMathML(str) {
  const dom = new DOMParser().parseFromString(str, "application/xml");
  return dom.documentElement; // <math> element
}

describe("Lucid Math converter", () => {
  test("mn renders numbers correctly", () => {
    const math = parseMathML("<math><mn>42</mn></math>");
    expect(convertMathML(math)).toBe("42");
  });

  test("mi renders identifiers correctly", () => {
    const math = parseMathML("<math><mi>x</mi></math>");
    expect(convertMathML(math)).toBe("x");
  });

  test("mo renders operator with spacing", () => {
    const math = parseMathML("<math><mn>1</mn><mo>+</mo><mn>2</mn></math>");
    expect(convertMathML(math)).toBe("1 + 2");
  });

  test("mfrac renders fraction as a/b", () => {
    const math = parseMathML("<math><mfrac><mn>1</mn><mn>2</mn></mfrac></math>");
    expect(convertMathML(math)).toBe("1/2");
  });
});