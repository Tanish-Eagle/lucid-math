// src/test/parseMathML.test.js
import { parseMathML } from "./helper.js";

describe("parseMathML utility", () => {
  test("removes whitespace-only text nodes", () => {
    const input = `
      <math>
        <mrow>
          <mi>a</mi>
          
          <mo>+</mo>
          
          <mi>b</mi>
        </mrow>
      </math>
    `;

    const root = parseMathML(input);
    const mrow = root.querySelector("mrow");

    // We expect only 3 children: mi, mo, mi
    expect(mrow.childNodes.length).toBe(3);
    expect(mrow.childNodes[0].nodeName).toBe("mi");
    expect(mrow.childNodes[1].nodeName).toBe("mo");
    expect(mrow.childNodes[2].nodeName).toBe("mi");
  });

  test("keeps non-whitespace text nodes", () => {
    const input = `
      <math>
        <mtext>   hello   </mtext>
      </math>
    `;

    const root = parseMathML(input);
    const mtext = root.querySelector("mtext");

    // Whitespace around text is preserved inside mtext
    expect(mtext.textContent).toBe("   hello   ");
  });
});
