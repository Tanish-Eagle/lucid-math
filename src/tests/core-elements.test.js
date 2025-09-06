import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("Basic elements", () => {
  test("mn renders numbers correctly", () => {
    const node = parseMathML("<math><mn>42</mn></math>").children[0];
    expect(convertMathML(node)).toBe("42");
  });

  test("mi renders identifiers correctly", () => {
    const node = parseMathML("<math><mi>x</mi></math>").children[0];
    expect(convertMathML(node)).toBe("x");
  });

  test("mo renders operator with spacing", () => {
    const node = parseMathML("<math><mn>1</mn><mo>+</mo><mn>2</mn></math>");
    expect(convertMathML(node)).toBe("1 + 2");
  });

  test("mfrac renders fraction as a/b", () => {
    const node = parseMathML("<math><mfrac><mn>1</mn><mn>2</mn></mfrac></math>").children[0];
    expect(convertMathML(node)).toBe("1/2");
  });
});
