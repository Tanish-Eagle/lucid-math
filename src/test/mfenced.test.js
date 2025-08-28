import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("Mfenced", () => {
  test("single child with default parentheses", () => {
    const node = parseMathML(
      `<math><mfenced><mi>x</mi></mfenced></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("(x)");
  });

  test("multiple children with default parentheses", () => {
    const node = parseMathML(
      `<math><mfenced><mi>a</mi><mo>+</mo><mi>b</mi></mfenced></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("(a + b)");
  });

  test("custom open and close attributes", () => {
    const node = parseMathML(
      `<math><mfenced open="[" close="]"><mi>y</mi></mfenced></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("[y]");
  });

  test("different open and close attributes", () => {
    const node = parseMathML(
      `<math><mfenced open="{" close="}"><mi>z</mi></mfenced></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("{z}");
  });

  test("empty mfenced", () => {
    const node = parseMathML(
      `<math><mfenced></mfenced></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("()");
  });
});
