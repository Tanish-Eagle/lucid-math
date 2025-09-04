// converter.js

const structuralMoSymbols = new Set(["(", ")", "|"]);

const moSpacedSymbols = new Set(["+", "−", "×", "÷", "-", "=", "|", "<", ">", "≤", "≥", "≠"]);

function wrapIfMrow(node, content) {
  if (node.localName === "mrow") {
    return `(${content})`;
  }
  return content; // ✅ fallback for non-mrow
}

function normalizeMo(node) {
  const text = node.textContent?.trim() || "";

  // Parentheses → keep them as-is
  if (text === "(" || text === ")") {
    return text;
  }

  // Absolute value bars → special case
  if (text === "|") {
    return "|";
  }

  // Everything else → just return
  return text;
}

function hasOperators(node) {
  return node?.nodeName === "mrow" && Array.from(node.childNodes).some(child => {
    return child.nodeName === "mo" && /[+\-×÷=<>≤≥≠]/.test(child.textContent);
  });
}

function handleMprescripts(node) {
  return "";
}

function handleMmultiscripts(node) {
  const children = Array.from(node.childNodes)
    .filter(n => n.nodeType === Node.ELEMENT_NODE);

  if (children.length === 0) return "";

  const base = convertMathML(children[0]);

  // Split into before and after <mprescripts/>
  const prescriptIndex = children.findIndex(el => el.tagName === "mprescripts");
  const postChildren = prescriptIndex === -1 ? children.slice(1) : children.slice(1, prescriptIndex);
  const preChildren  = prescriptIndex === -1 ? [] : children.slice(prescriptIndex + 1);

  // Helper to format sub/sup pairs
  function formatPairs(elems) {
    const pairs = [];
    for (let i = 0; i < elems.length; i += 2) {
      const sub = elems[i] ? convertMathML(elems[i]) : "";
      const sup = elems[i + 1] ? convertMathML(elems[i + 1]) : "";
      if (!sub && !sup) continue;

      let pair = "";
      if (sub) pair += `_(${sub})`;
      if (sup) pair += `^(${sup})`;
      pairs.push(pair);
    }
    return pairs.join("");
  }

  const postStr = formatPairs(postChildren);
  const preStr  = formatPairs(preChildren);

  // Convention: pre-scripts go before base in square brackets
  if (preStr) {
    return `${preStr}[${base}]${postStr}`;
  } else {
    return `${base}${postStr}`;
  }
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

function handleMsub(node) {
  // Only keep element children (ignore whitespace text nodes)
  const elements = Array.from(node.childNodes).filter(
    n => n.nodeType === Node.ELEMENT_NODE
  );

  if (elements.length !== 2) {
    console.warn("⚠️ <msub> does not have exactly 2 element children.", node);
    return "";
  }

  const base = convertMathML(elements[0]);
  const sub = convertMathML(elements[1]);
  return `${base}_${sub}`; // or `${base}_(${sub})`
}

function handleMsubsup(node) {
  // Get only element children (ignore whitespace/text nodes)
  const elements = Array.from(node.childNodes)
    .filter(n => n.nodeType === Node.ELEMENT_NODE);

  if (elements.length !== 3) {
    console.warn("⚠️ <msubsup> does not have exactly 3 element children.", node);
    return "";
  }

  const base = convertMathML(elements[0]);
  const sub = convertMathML(elements[1]);
  const sup = convertMathML(elements[2]);

  return `${base}_${sub}^${sup}`;
}

function handleMsqrt(node) {
  const children = Array.from(node.childNodes);
  const inner = children.map(child => {
    const converted = convertMathML(child);
    return wrapIfMrow(child, converted);
  }).join(" ");
  return `√${inner}`;
}

function handleMroot(node) {
  // Get only element children
  const elements = Array.from(node.childNodes)
    .filter(n => n.nodeType === Node.ELEMENT_NODE);

  if (elements.length === 2) {
    const base = convertMathML(elements[0]);
    const index = convertMathML(elements[1]).trim();

    // Handle ordinal endings (1st, 2nd, 3rd, 4th, etc.)
    function ordinal(n) {
      const num = parseInt(n, 10);
      if (isNaN(num)) return `${n}th`; // fallback if it's not numeric
      const tens = num % 100;
      if (tens >= 11 && tens <= 13) return `${num}th`;
      switch (num % 10) {
        case 1: return `${num}st`;
        case 2: return `${num}nd`;
        case 3: return `${num}rd`;
        default: return `${num}th`;
      }
    }

    return `${ordinal(index)} root of (${base})`;
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
  const base = children[0] ? wrapIfMrow(children[0], convertMathML(children[0])) : "";
  const over = children[1] ? wrapIfMrow(children[1], convertMathML(children[1])) : "";

  return `${base} over ${over}`;
}

function handleMunder(node) {
  const baseNode = node.childNodes[0];
  const underNode = node.childNodes[1];

  const base = baseNode ? wrapIfMrow(baseNode, convertMathML(baseNode)) : "";
  const under = underNode ? wrapIfMrow(underNode, convertMathML(underNode)) : "";

  if (under.replace(/_/g, "").trim() === "") {
    return base;
  }
  return `${base} under ${under}`;
}

function handleMunderover(node) {
  // keep only element children (ignore whitespace text nodes)
  const elements = Array.from(node.childNodes)
    .filter(n => n.nodeType === Node.ELEMENT_NODE);

  if (elements.length !== 3) {
    console.warn("⚠️ <munderover> does not have exactly 3 element children.", node);
    return "";
  }

  const base = convertMathML(elements[0]);
  const under = convertMathML(elements[1]);
  const over = convertMathML(elements[2]);

  // convention: base with _() for under, ^() for over
  return `${base}_(${under})^(${over})`;
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

function getMathToken(node) {
  return node.textContent.trim();
}

function isStructuralMo(node) {
  if (node.nodeName !== "mo") return false;
  const text = node.textContent?.trim();
  if (text === "\u2062") return true;
  return structuralMoSymbols.has(text);
}

// Handle <mo> elements
function handleMo(node) {
  if (isStructuralMo(node)) {
    return node.textContent.trim();
  }
  return getMathToken(node);
}

function handleMathGroup(node) {
  const children = Array.from(node.childNodes).map(convertMathML).filter(Boolean);
  let result = "";

  for (let i = 0; i < children.length; i++) {
    const current = children[i];
    const next = children[i + 1];
    result += current;

    if (!next) continue;

    const currentTrim = current.trim();
    const nextTrim = next.trim();

    // 🚫 No space just inside parentheses or absolute bars
    if ((currentTrim === "(") || (nextTrim === ")") ||
      (currentTrim === "|") || (nextTrim === "|")) {
      continue;
    }

     // Otherwise insert space if operator boundaries or for readability
    result += " ";
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
    case "ms":
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
    case "annotation":
    case "annotation-xml":
    case "mpad":
      return handleVisualTags();

    case "mover":
      return handleMover(node);
    case "msub":
      return handleMsub(node);
    case "msubsup":
      return handleMsubsup(node);
    case "munderover":
      return handleMunderover(node);
    case "mmultiscripts":
      return handleMmultiscripts(node);
    case "mprescripts":
      return handleMprescripts(node);
    default:
      return `[Unsupported tag: ${tag}]`;
  }
}

// Expose the functions globally for use in content-script.js
window.convertMathML = convertMathML;
window.preprocessMathML = preprocessMathML;

//export { convertMathML };