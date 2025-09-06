import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("Operators", () => {
  test("simple addition", () => {
    const node = parseMathML(`<math><mn>2</mn><mo>+</mo><mn>2</mn></math>`);
    expect(convertMathML(node)).toBe("2 + 2");
  });

  test("simple subtraction", () => {
    const node = parseMathML(`<math><mn>5</mn><mo>−</mo><mn>3</mn></math>`);
    expect(convertMathML(node)).toBe("5 − 3");
  });

  test("multiplication", () => {
    const node = parseMathML(`<math><mn>4</mn><mo>×</mo><mn>3</mn></math>`);
    expect(convertMathML(node)).toBe("4 × 3");
  });

  test("division", () => {
    const node = parseMathML(`<math><mn>10</mn><mo>÷</mo><mn>2</mn></math>`);
    expect(convertMathML(node)).toBe("10 ÷ 2");
  });

  test("expression with parentheses", () => {
    const node = parseMathML(`<math><mo>(</mo><mn>1</mn><mo>+</mo><mn>2</mn><mo>)</mo></math>`);
    expect(convertMathML(node)).toBe("(1 + 2)");
  });

  test("inequality", () => {
    const node = parseMathML(`<math><mn>7</mn><mo>≥</mo><mn>5</mn></math>`);
    expect(convertMathML(node)).toBe("7 ≥ 5");
  });

  test("not equal", () => {
    const node = parseMathML(`<math><mn>3</mn><mo>≠</mo><mn>4</mn></math>`);
    expect(convertMathML(node)).toBe("3 ≠ 4");
  });
});
