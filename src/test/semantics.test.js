import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("Semantics", () => {
  test("single child", () => {
    const node = parseMathML(
      `<math><semantics><mi>x</mi></semantics></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("x");
  });

  test("multiple children, only first element child used", () => {
    const node = parseMathML(
      `<math><semantics><mi>y</mi><annotation encoding="application/xhtml+xml">ignored</annotation></semantics></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("y");
  });

  test("nested element child", () => {
    const node = parseMathML(
      `<math><semantics><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow></semantics></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("a + b");
  });

  test("no children", () => {
    const node = parseMathML(
      `<math><semantics></semantics></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("");
  });
});
