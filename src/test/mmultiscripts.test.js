import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("<mmultiscripts>", () => {
  it("converts simple mmultiscripts with pre- and post-scripts", () => {
    const input = `
      <math>
        <mmultiscripts>
          <mi>X</mi>
          <mi>a</mi>
          <mi>b</mi>
          <mprescripts />
          <mi>c</mi>
          <mi>d</mi>
        </mmultiscripts>
      </math>
    `;
    const root = parseMathML(input);
    expect(convertMathML(root)).toBe("_(c)^(d)[X]_(a)^(b)");
  });

  it("handles missing sub/sup with empty mrow", () => {
    const input = `
      <math>
        <mmultiscripts>
          <mi>X</mi>
          <mrow></mrow>
          <mi>b</mi>
          <mprescripts />
          <mi>c</mi>
          <mrow></mrow>
        </mmultiscripts>
      </math>
    `;
    const root = parseMathML(input);
    expect(convertMathML(root)).toBe("_(c)[X]^(b)");
  });

  it("converts multiple pre and post scripts", () => {
    const input = `
      <math>
        <mmultiscripts>
          <mi>X</mi>
          <mn>1</mn>
          <mn>2</mn>
          <mn>3</mn>
          <mn>4</mn>
          <mprescripts />
          <mn>5</mn>
          <mn>6</mn>
          <mn>7</mn>
          <mn>8</mn>
        </mmultiscripts>
      </math>
    `;
    const root = parseMathML(input);
    expect(convertMathML(root)).toBe("_(5)^(6)_(7)^(8)[X]_(1)^(2)_(3)^(4)");
  });

  it("handles malformed <mmultiscripts> without a base", () => {
    const input = `
      <math>
        <mmultiscripts>
          <mi>a</mi>
          <mi>b</mi>
        </mmultiscripts>
      </math>
    `;
    const root = parseMathML(input);
    expect(convertMathML(root)).toBe("a_(b)");
  });
});
