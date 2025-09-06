// src/test/helper.js
function parseMathML(str) {
  const dom = new DOMParser().parseFromString(str, "application/xml");

  // Remove whitespace-only text nodes recursively
  function clean(node) {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.TEXT_NODE && !child.nodeValue.trim()) {
        node.removeChild(child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        clean(child);
      }
    }
  }

  const root = dom.documentElement;
  clean(root);
  return root;
}



export { parseMathML };
