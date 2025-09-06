import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("<munderover>", () => {
  it("converts sum with lower and upper bounds", () => {
    const input = `
      <math>
        <munderover>
          <mo>∑</mo>
          <mrow>
            <mi>n</mi>
            <mo>=</mo>
            <mn>1</mn>
          </mrow>
          <mrow>
            <mo>+</mo>
            <mn>∞</mn>
          </mrow>
        </munderover>
      </math>
    `;
    const root = parseMathML(input);
    // Expect output with spaces around = and +
    expect(convertMathML(root)).toBe("∑_(n = 1)^(+ ∞)");
  });

  it("converts product with lower and upper bounds", () => {
    const input = `
      <math>
        <munderover>
          <mo>∏</mo>
          <mrow>
            <mi>i</mi>
            <mo>=</mo>
            <mn>1</mn>
          </mrow>
          <mrow>
            <mi>N</mi>
          </mrow>
        </munderover>
      </math>
    `;
    const root = parseMathML(input);
    // Expect output with space around =
    expect(convertMathML(root)).toBe("∏_(i = 1)^(N)");
  });
});
