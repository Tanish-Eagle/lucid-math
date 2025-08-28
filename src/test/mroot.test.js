import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("handleMroot", () => {
  test("renders cube root correctly", () => {
    const node = parseMathML("<mroot><mi>x</mi><mn>3</mn></mroot>");
    expect(convertMathML(node)).toBe("3rd root of (x)");
  });

  test("renders 4th root correctly", () => {
    const node = parseMathML("<mroot><mi>x</mi><mn>4</mn></mroot>");
    expect(convertMathML(node)).toBe("4th root of (x)");
  });

  test("handles ordinal edge case 11 -> 11th", () => {
    const node = parseMathML("<mroot><mi>x</mi><mn>11</mn></mroot>");
    expect(convertMathML(node)).toBe("11th root of (x)");
  });

  test("handles ordinal edge case 12 -> 12th", () => {
    const node = parseMathML("<mroot><mi>x</mi><mn>12</mn></mroot>");
    expect(convertMathML(node)).toBe("12th root of (x)");
  });

  test("handles ordinal edge case 13 -> 13th", () => {
    const node = parseMathML("<mroot><mi>x</mi><mn>13</mn></mroot>");
    expect(convertMathML(node)).toBe("13th root of (x)");
  });

  test("handles 21 -> 21st correctly", () => {
    const node = parseMathML("<mroot><mi>x</mi><mn>21</mn></mroot>");
    expect(convertMathML(node)).toBe("21st root of (x)");
  });

  test("handles non-numeric indices gracefully", () => {
    const node = parseMathML("<mroot><mi>x</mi><mi>n</mi></mroot>");
    expect(convertMathML(node)).toBe("nth root of (x)");
  });

  test("returns empty string if not enough children", () => {
    const node = parseMathML("<mroot><mi>x</mi></mroot>");
    expect(convertMathML(node)).toBe("");
  });
});
