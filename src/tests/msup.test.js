import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("handleMsup", () => {
  test("simple exponentiation a^2", () => {
    const node = parseMathML("<msup><mi>a</mi><mn>2</mn></msup>");
    expect(convertMathML(node)).toBe("a^2");
  });

  test("variable raised to another variable a^b", () => {
    const node = parseMathML("<msup><mi>a</mi><mi>b</mi></msup>");
    expect(convertMathML(node)).toBe("a^b");
  });

  test("number raised to variable 2^x", () => {
    const node = parseMathML("<msup><mn>2</mn><mi>x</mi></msup>");
    expect(convertMathML(node)).toBe("2^x");
  });

  test("nested superscript a^(b^c)", () => {
    const node = parseMathML("<msup><mi>a</mi><msup><mi>b</mi><mi>c</mi></msup></msup>");
    expect(convertMathML(node)).toBe("a^b^c");
  });

  test("invalid msup with one child", () => {
    const node = parseMathML("<msup><mi>a</mi></msup>");
    expect(convertMathML(node)).toBe("");
  });

  test("invalid msup with three children", () => {
    const node = parseMathML("<msup><mi>a</mi><mi>b</mi><mi>c</mi></msup>");
    expect(convertMathML(node)).toBe("");
  });
});
