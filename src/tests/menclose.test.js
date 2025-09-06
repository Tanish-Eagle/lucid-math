import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("Menclose", () => {
  test("simple box", () => {
    const math = parseMathML(`<math><menclose notation="box"><mi>x</mi></menclose></math>`);
    const node = math.querySelector("menclose");
    expect(convertMathML(node)).toBe("[x]");
  });

  test("circle notation", () => {
    const math = parseMathML(`<math><menclose notation="circle"><mn>5</mn></menclose></math>`);
    const node = math.querySelector("menclose");
    expect(convertMathML(node)).toBe("(○5○)");
  });

  test("multiple notations", () => {
    const math = parseMathML(
      `<math><menclose notation="top bottom"><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow></menclose></math>`
    );
    const node = math.querySelector("menclose");
    expect(convertMathML(node)).toBe("(top overline a + b) and (bottom underline a + b)");
  });

  test("no children", () => {
    const math = parseMathML(`<math><menclose notation="box"/></math>`);
    const node = math.querySelector("menclose");
    expect(convertMathML(node)).toBe("[]");
  });

  test("default notation when missing", () => {
    const math = parseMathML(`<math><menclose><mi>x</mi></menclose></math>`);
    const node = math.querySelector("menclose");
    expect(convertMathML(node)).toBe("long division of (x)");
  });
});
