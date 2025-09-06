import { convertMathML } from "../converter.js";
import { parseMathML } from "./helper.js";

describe("Tables", () => {
  test("single row table", () => {
    const node = parseMathML(
      `<math>
        <mtable>
          <mtr><mtd>a</mtd><mtd>b</mtd></mtr>
        </mtable>
      </math>`
    ).children[0];
    expect(convertMathML(node)).toBe("a b");
  });

  test("multi-row table", () => {
    const node = parseMathML(
      `<math>
        <mtable>
          <mtr><mtd>a</mtd><mtd>b</mtd></mtr>
          <mtr><mtd>c</mtd><mtd>d</mtd></mtr>
        </mtable>
      </math>`
    ).children[0];
    expect(convertMathML(node)).toBe("a b\nc d");
  });

  test("single mtd", () => {
    const node = parseMathML(
      `<math>
        <mtable>
          <mtr><mtd>a</mtd></mtr>
        </mtable>
      </math>`
    ).children[0];
    expect(convertMathML(node)).toBe("a");
  });

  test("multiple mtd", () => {
    const node = parseMathML(
      `<math>
        <mtable>
          <mtr><mtd>a</mtd><mtd>b</mtd><mtd>c</mtd></mtr>
        </mtable>
      </math>`
    ).children[0];
    expect(convertMathML(node)).toBe("a b c");
  });
test("empty table", () => {
  const node = parseMathML(
    `<math>
      <mtable></mtable>
    </math>`
  ).children[0];
  expect(convertMathML(node)).toBe("");
});
test("row with empty cell", () => {
  const node = parseMathML(
    `<math>
      <mtable>
        <mtr><mtd>a</mtd><mtd></mtd><mtd>b</mtd></mtr>
      </mtable>
    </math>`
  ).children[0];
  expect(convertMathML(node)).toBe("a b"); // depending on how your converter handles empty cells
});
test("mtd with nested content", () => {
  const node = parseMathML(
    `<math>
      <mtable>
        <mtr><mtd><mi>x</mi><mo>+</mo><mi>y</mi></mtd></mtr>
      </mtable>
    </math>`
  ).children[0];
  expect(convertMathML(node)).toBe("x + y");
});

});