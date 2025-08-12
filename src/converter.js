// converter.js

const moSpacedSymbols = new Set(["+", "−", "×", "÷", "-", "=", "(", ")", "|", "<", ">", "≤", "≥", "≠"]);

function hasOperators(node) {
  return node?.nodeName === "mrow" && Array.from(node.childNodes).some(child => {
    return child.nodeName === "mo" && /[+\-×÷=<>≤≥≠]/.test(child.textContent);
  });
}

function handleMfrac(node) {
  console.log("🔢 Entered <mfrac>", node.childNodes);
  const elements = Array.from(node.children);
  if (elements.length !== 2) {
    console.warn("⚠️ <mfrac> does not have exactly 2 element children.", elements);
    return "";
  }
  const numNode = elements[0];
  const denNode = elements[1];
  const num = convertMathML(numNode);
  const den = convertMathML(denNode);
  console.log(" ➕ Numerator:", num);
  console.log(" ➗ Denominator:", den);
  const numNeedsParens = num.includes('/') || hasOperators(numNode);
  const denNeedsParens = den.includes('/') || hasOperators(denNode);
  const formattedNum = numNeedsParens ? `(${num})` : num;
  const formattedDen = denNeedsParens ? `(${den})` : den;
  return `${formattedNum}/${formattedDen}`;
}

function handleMsup(node) {
  if (node.childNodes.length !== 2) {
    console.warn("⚠️ <msup> does not have exactly 2 children.", node);
    return "";
  }
  const base = convertMathML(node.childNodes[0]);
  const exp = convertMathML(node.childNodes[1]);
  return `${base}^${exp}`;
}

function handleMsqrt(node) {
  const inner = Array.from(node.childNodes).map(convertMathML).join(" ");
  return `√${inner}`;
}

function handleMroot(node) {
  if (node.childNodes.length === 2) {
    const base = convertMathML(node.childNodes[0]);
    const index = convertMathML(node.childNodes[1]);
    const superscripts = {
      "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
      "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
    };
    const sup = [...index].map(c => superscripts[c] || c).join("");
    return `${sup}√${base}`;
  }
  return "";
}

// function handleMenclose(node) {
//   const notation = (node.getAttribute("notation") || "").trim().toLowerCase();
//   const inner = Array.from(node.childNodes)
//     .map(convertMathML)
//     .join(" ");

//   if (notation.includes("longdiv")) {
//     return `/(${inner})`;
//   }

//   return `[enclosed: ${inner}]`;
// }

function handleMenclose(node) {
  // Get the notation attribute (may be multiple space-separated values)
  let notation = node.getAttribute("notation") || "longdiv";
  let notations = notation.split(/\s+/);

  // Recursively process all child nodes
  let childText = "";
  for (let i = 0; i < node.childNodes.length; i++) {
    childText += convertMathML(node.childNodes[i]);
  }

  // Wrap or annotate based on notation
  // (Here we just append text info; you could format differently)
  let notationText = notations.map(n => {
    switch (n) {
      case "longdiv": return `long division of (${childText})`;
      case "actuarial": return `actuarial symbol for (${childText})`;
      case "radical": return `square root of (${childText})`;
      case "box": return `[${childText}]`;
      case "circle": return `(○${childText}○)`;
      case "roundedbox": return `(rounded box: ${childText})`;
      case "top": return `(top overline ${childText})`;
      case "left": return `(left vertical bar ${childText})`;
      case "right": return `(right vertical bar ${childText})`;
      case "bottom": return `(bottom underline ${childText})`;
      default: return `(${n} ${childText})`;
    }
  }).join(" and ");

  return notationText;
}

function handleMover(node) {
  const children = Array.from(node.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE);
  const base = children[0] ? convertMathML(children[0]) : "";
  const over = children[1] ? convertMathML(children[1]) : "";

  return `${base} (${over} above)`;
}

function handleMunder(node) {
  const base = convertMathML(node.childNodes[0]);
  const under = convertMathML(node.childNodes[1]);

  if (under.replace(/_/g, "").trim() === "") {
    return base;
  }

  return `${base} [under: ${under}]`;
}

function handleMtable(node) {
  return Array.from(node.children)
    .map(convertMathML)
    .filter(Boolean)
    .join("\n");
}
// mtr tag handler
function handleMtr(node) {
  const content = Array.from(node.children)
    .map(convertMathML)
    .filter(Boolean)
    .join(" ");
  return content.trim() ? content : "";
}

// mtd tag handler
function handleMtd(node) {
  return Array.from(node.childNodes)
    .map(convertMathML)
    .filter(Boolean)
    .join(" ");
}

function handleSemantics(node) {
  const firstElementChild = Array.from(node.children).find(child => child.nodeType === 1);
  return firstElementChild ? convertMathML(firstElementChild) : "";
}

function handleMfenced(node) {
  const inner = Array.from(node.childNodes).map(convertMathML).join(" ");
  const open = node.getAttribute("open") || "(";
  const close = node.getAttribute("close") || ")";
  return `${open}${inner}${close}`;
}

function handleMo(node) {
  const text = node.textContent.trim();

  // Ignore invisible times (U+2062)
  if (text === "\u2062") return "";

  return moSpacedSymbols.has(text) ? ` ${text} ` : text;
}

function getMathToken(node) {
  return node.textContent.trim();
}

function handleMathGroup(node) {
  const children = Array.from(node.childNodes).map(convertMathML).filter(Boolean);
  let result = "";

  for (let i = 0; i < children.length; i++) {
    const current = children[i];
    const next = children[i + 1];

    result += current;

    if (!next) continue; // nothing after this

    const currentTrim = current.trim();
    const nextTrim = next.trim();

    const currentEndsWithOp = /[+\-×÷=()|<>≤≥≠]$/.test(currentTrim);
    const nextStartsWithOp = /^[+\-×÷=()|<>≤≥≠]/.test(nextTrim);

    // ✅ Simple rule: insert space only if operator or bracket boundaries
    if (currentEndsWithOp || nextStartsWithOp) {
      result += " ";
    }
    // Else: add space for readability
    else {
      result += " ";
    }
  }
  return result.trim();
}

function preprocessMathML(raw) {
  return raw
    .replace(/&le;/g, '≤')
    .replace(/&ge;/g, '≥')
    .replace(/&ne;/g, '≠')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function convertMathML(node) {
  console.log("🔧 Converting:", node);
  if (!node.localName) {
    return node.textContent?.trim() || "";
  }

  const tag = node.localName;

  if (tag === "math" || tag === "mrow") {
    return handleMathGroup(node);
  }

  // if (tag === "math" || tag === "mrow") {
  //   const children = Array.from(node.childNodes).map(convertMathML).filter(Boolean);
  //   let result = "";

  //   for (let i = 0; i < children.length; i++) {
  //     const current = children[i];
  //     const next = children[i + 1];

  //     result += current;

  //     if (!next) continue; // nothing after this

  //     const currentTrim = current.trim();
  //     const nextTrim = next.trim();

  //     const currentEndsWithOp = /[+\-×÷=()|<>≤≥≠]$/.test(currentTrim);
  //     const nextStartsWithOp = /^[+\-×÷=()|<>≤≥≠]/.test(nextTrim);

  //     // ✅ Simple rule: insert space only if operator or bracket boundaries
  //     if (currentEndsWithOp || nextStartsWithOp) {
  //       result += " ";
  //     }
  //     // Else: add space for readability
  //     else {
  //       result += " ";
  //     }
  //   }
  //   return result.trim();
  // }

  if (tag === "mn" || tag === "mi" || tag === "mtext") {
    return getMathToken(node);
  }

  // if (tag === "mn" || tag === "mi" || tag === "mtext") {
  //   return node.textContent.trim();
  // }

  if (tag === "mo") {
    return handleMo(node);
  }

  // if (tag === "mo") {
  //   const text = node.textContent.trim();

  //   // Ignore invisible times (U+2062)
  //   if (text === "\u2062") return "";

  //   const spaced = new Set(["+", "−", "×", "÷", "-", "=", "(", ")", "|", "<", ">", "≤", "≥", "≠"]);
  //   return spaced.has(text) ? ` ${text} ` : text;
  // }

  if (tag === "msqrt") {
    return handleMsqrt(node);
  }

  // if (tag === "msqrt") {
  //   const inner = Array.from(node.childNodes).map(convertMathML).join(" ");
  //   return `√${inner}`;
  // }

  if (tag === "mroot") {
    return handleMroot(node);
  }

  // if (tag === "mroot") {
  //   if (node.childNodes.length === 2) {
  //     const base = convertMathML(node.childNodes[0]);
  //     const index = convertMathML(node.childNodes[1]);
  //     const superscripts = {
  //       "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  //       "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
  //     };
  //     const sup = [...index].map(c => superscripts[c] || c).join("");
  //     return `${sup}√${base}`;
  //   }
  //   return "";
  // }

  if (tag === "mfrac") {
    return handleMfrac(node);
  }
  // if (tag === "mfrac") {
  //   console.log("🔢 Entered <mfrac>", node.childNodes);
  //   const elements = Array.from(node.children);
  //   if (elements.length === 2) {
  //     const numNode = elements[0];
  //     const denNode = elements[1];

  //     const num = convertMathML(numNode);
  //     const den = convertMathML(denNode);
  //     console.log(" ➕ Numerator:", num);
  //     console.log(" ➗ Denominator:", den);

  //     const hasOperators = (n) => {
  //       return n?.nodeName === "mrow" && Array.from(n.childNodes).some(child => {
  //         return child.nodeName === "mo" && /[+\-×÷=<>≤≥≠]/.test(child.textContent);
  //       });
  //     };

  //     const numNeedsParens = num.includes('/') || hasOperators(numNode);
  //     const denNeedsParens = den.includes('/') || hasOperators(denNode);

  //     const formattedNum = numNeedsParens ? `(${num})` : num;
  //     const formattedDen = denNeedsParens ? `(${den})` : den;

  //     return `${formattedNum}/${formattedDen}`;
  //   } else {
  //     console.warn("⚠️ <mfrac> does not have exactly 2 element children.", elements);
  //   }
  //   return "";
  // }

  if (tag === "mfenced") {
    return handleMfenced(node);
  }

  // if (tag === "mfenced") {
  //   const inner = Array.from(node.childNodes).map(convertMathML).join(" ");
  //   const open = node.getAttribute("open") || "(";
  //   const close = node.getAttribute("close") || ")";
  //   return `${open}${inner}${close}`;
  // }

  if (tag === "msup") {
    return handleMsup(node);
  }

  // if (tag === "msup") {
  //   if (node.childNodes.length === 2) {
  //     const base = convertMathML(node.childNodes[0]);
  //     const exp = convertMathML(node.childNodes[1]);
  //     return `${base}^${exp}`;
  //   }
  //   return "";
  // }

  if (tag === "merror") {
    return "";
  }

  if (tag === "semantics") {
    return handleSemantics(node);
  }

  // if (tag === "semantics") {
  //   const firstElementChild = Array.from(node.children).find(child => child.nodeType === 1);
  //   return firstElementChild ? convertMathML(firstElementChild) : "";
  // }

  if (tag === "mtable") {
    return handleMtable(node);
  }

  // if (tag === "mtable") {
  //   return Array.from(node.children)
  //     .map(convertMathML)
  //     .filter(Boolean)
  //     .join("\n");
  // }

  if (tag === "mtr") {
    return handleMtr(node);
  }

  // if (tag === "mtr") {
  //   const content = Array.from(node.children)
  //     .map(convertMathML)
  //     .filter(Boolean)
  //     .join(" ");
  //   return content.trim() ? content : "";
  // }

  if (tag === "mtd") {
    return handleMtd(node);
  }

  // if (tag === "mtd") {
  //   return Array.from(node.childNodes).map(convertMathML).join(" ");
  // }

  if (tag === "munder") {
    return handleMunder(node);
  }

  // if (tag === "munder") {
  //   const base = convertMathML(node.childNodes[0]);
  //   const under = convertMathML(node.childNodes[1]);

  //   if (under.replace(/_/g, "").trim() === "") {
  //     return base;
  //   }

  //   return `${base} [under: ${under}]`;
  // }

  if (tag === "menclose") {
    return handleMenclose(node);
  }

  // if (tag === "menclose") {
  //   const notation = node.getAttribute("notation") || "";
  //   const inner = Array.from(node.childNodes).map(convertMathML).join(" ");

  //   if (notation.includes("longdiv")) {
  //     return `/(${inner})`;
  //   }

  //   return `[enclosed: ${inner}]`;
  // }

  if (tag === "mspace") {
    // Purely visual spacing; skip it.
    return "";
  }
  if (tag === "mstyle") {
    // Skip visual styling and process its children normally
    return Array.from(node.childNodes).map(convertMathML).join(" ");
  }

  if (tag === "mphantom") {
    // Purely visual, skip its contents entirely
    return "";
  }

  if (tag === "mover") {
    return handleMover(node);
  }

  // if (tag === "mover") {
  //   const base = convertMathML(node.childNodes[0]);
  //   const over = convertMathML(node.childNodes[1]);

  //   // Simple readable rendering:
  //   return `${base} (${over} above)`;

  //   // Or, if you prefer:
  //   // return `${base}^(${over})`;

  //   // Or even:
  //   // return `${over} ${base}`;
  // }

  return `[Unsupported tag: ${tag}]`;
}

// Expose the functions globally for use in content-script.js
window.convertMathML = convertMathML;
window.preprocessMathML = preprocessMathML;

