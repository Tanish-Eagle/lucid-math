import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("Munder", () => {
  test("sum with index", () => {
    const node = parseMathML(`<math><munder><mo>∑</mo><mi>i</mi></munder></math>`).children[0];
    expect(convertMathML(node)).toBe("∑ under i");
  });

  test("lim with n → ∞", () => {
    const node = parseMathML(
      `<math><munder><mo>lim</mo><mrow><mi>n</mi><mo>→</mo><mo>∞</mo></mrow></munder></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("lim under (n → ∞)");
  });

  test("integral with bounds", () => {
    const node = parseMathML(`<math><munder><mo>∫</mo><mn>0</mn></munder></math>`).children[0];
    expect(convertMathML(node)).toBe("∫ under 0");
  });
});