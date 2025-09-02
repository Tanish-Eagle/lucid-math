import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("<msub> tag", () => {
  test("simple variable with numeric subscript", () => {
    const input = `<math><msub><mi>X</mi><mn>1</mn></msub></math>`;
    const node = parseMathML(input);
    expect(convertMathML(node)).toBe("X_1");
  });

  test("variable with variable subscript", () => {
    const input = `<math><msub><mi>a</mi><mi>i</mi></msub></math>`;
    const node = parseMathML(input);
    expect(convertMathML(node)).toBe("a_i");
  });

  test("number with numeric subscript", () => {
    const input = `<math><msub><mn>10</mn><mn>2</mn></msub></math>`;
    const node = parseMathML(input);
    expect(convertMathML(node)).toBe("10_2");
  });

  test("grouped base with subscript", () => {
    const input = `
      <math>
        <msub>
          <mrow>
            <mi>x</mi>
            <mo>+</mo>
            <mi>y</mi>
          </mrow>
          <mn>3</mn>
        </msub>
      </math>`;
    const node = parseMathML(input);
    // Depending on your mrow handling this may add spaces around operators
    expect(convertMathML(node)).toBe("x + y_3");
  });

  test("invalid msub (wrong number of children)", () => {
    const input = `<math><msub><mi>x</mi></msub></math>`;
    const node = parseMathML(input);
    expect(convertMathML(node)).toBe(""); // should return empty on warning
  });
});
