import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";


describe("Square roots", () => {
  test("simple square root", () => {
    const node = parseMathML(`<math><msqrt><mn>9</mn></msqrt></math>`).children[0];
    expect(convertMathML(node)).toBe("√9");
  });

  test("square root with expression", () => {
    const node = parseMathML(
      `<math><msqrt><mrow><mn>2</mn><mo>+</mo><mn>3</mn></mrow></msqrt></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("√(2 + 3)");
  });

  test("nested square roots", () => {
    const node = parseMathML(`<math><msqrt><msqrt><mn>16</mn></msqrt></msqrt></math>`).children[0];
    expect(convertMathML(node)).toBe("√√16");
  });
});
