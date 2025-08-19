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
  // Get only element children
  const elements = Array.from(node.childNodes)
    .filter(n => n.nodeType === Node.ELEMENT_NODE);

  if (elements.length === 2) {
    const base = convertMathML(elements[0]);
    const index = convertMathML(elements[1]).trim();

    const superscripts = {
      "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
      "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
    };

    // Decide format based on single or multiple digits
    if (/^\d$/.test(index)) {
      // Single digit → superscript
      const sup = superscripts[index] || index;
      return `${sup}√(${base})`;
    } else {
      // Multi-digit → plain text with "th root of"
      return `${index}th root of (${base})`;
    }
  }
  return "";
}


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

function handleVisualTags() {
  return "";
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

  switch (tag) {
    case "math":
    case "mrow":
      return handleMathGroup(node);

    case "mn":
    case "mi":
    case "mtext":
      return getMathToken(node);

    case "mo":
      return handleMo(node);

    case "msqrt":
      return handleMsqrt(node);

    case "mroot":
      return handleMroot(node);

    case "mfrac":
      return handleMfrac(node);

    case "mfenced":
      return handleMfenced(node);

    case "msup":
      return handleMsup(node);

    case "merror":
      return "";

    case "semantics":
      return handleSemantics(node);

    case "mtable":
      return handleMtable(node);

    case "mtr":
      return handleMtr(node);

    case "mtd":
      return handleMtd(node);

    case "munder":
      return handleMunder(node);

    case "menclose":
      return handleMenclose(node);

    case "mstyle":
      // Skip visual styling and process its children normally
      return Array.from(node.childNodes).map(convertMathML).join(" ");

    case "mspace":
    case "mphantom":
      return handleVisualTags();

    case "mover":
      return handleMover(node);

    default:
      return `[Unsupported tag: ${tag}]`;
  }
}

// Expose the functions globally for use in content-script.js
window.convertMathML = convertMathML;
window.preprocessMathML = preprocessMathML;

