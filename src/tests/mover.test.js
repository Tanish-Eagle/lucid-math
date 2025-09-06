import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";


describe("Mover", () => {
  test("x with bar", () => {
    const node = parseMathML(`<math><mover><mi>x</mi><mo>‾</mo></mover></math>`).children[0];
    expect(convertMathML(node)).toBe("x over ‾");
  });

  test("y with arrow", () => {
    const node = parseMathML(`<math><mover><mi>y</mi><mo>→</mo></mover></math>`).children[0];
    expect(convertMathML(node)).toBe("y over →");
  });

  test("complex mover", () => {
    const node = parseMathML(
      `<math><mover><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow><mo>^</mo></mover></math>`
    ).children[0];
    expect(convertMathML(node)).toBe("(a + b) over ^");
  });
});