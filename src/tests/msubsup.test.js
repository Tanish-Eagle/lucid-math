import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("msubsup tag", () => {
  test("integral with lower and upper bounds", () => {
    const input = `
      <math>
        <msubsup>
          <mo>&#x222B;</mo>
          <mn>0</mn>
          <mn>1</mn>
        </msubsup>
      </math>
    `;

    const node = parseMathML(input);
    const result = convertMathML(node);
    expect(result).toBe("∫_0^1");
  });

  test("variable with subscript and superscript", () => {
    const input = `
      <math>
        <msubsup>
          <mi>x</mi>
          <mn>1</mn>
          <mn>2</mn>
        </msubsup>
      </math>
    `;

    const node = parseMathML(input);
    const result = convertMathML(node);
    expect(result).toBe("x_1^2");
  });

  test("operator with subscript and superscript", () => {
    const input = `
      <math>
        <msubsup>
          <mo>∑</mo>
          <mi>i</mi>
          <mn>n</mn>
        </msubsup>
      </math>
    `;

    const node = parseMathML(input);
    const result = convertMathML(node);
    expect(result).toBe("∑_i^n");
  });

  test("nested msubsup inside mrow", () => {
    const input = `
      <math>
        <mrow>
          <msubsup>
            <mi>a</mi>
            <mn>2</mn>
            <mn>3</mn>
          </msubsup>
          <mo>+</mo>
          <mi>b</mi>
        </mrow>
      </math>
    `;

    const node = parseMathML(input);
    const result = convertMathML(node);
    expect(result).toBe("a_2^3 + b");
  });
});
