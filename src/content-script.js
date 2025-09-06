/* global convertMathML */

function processMathElements(root = document) {
  const mathElements = root.querySelectorAll("math:not([data-processed])");
//  console.log(`🔍 Found ${mathElements.length} new <math> elements.`);

  mathElements.forEach((el) => {
    el.setAttribute("data-processed", "true");

    const converted = convertMathML(el).trim();
//    console.log("📐 Converted output:", JSON.stringify(converted)); // wrapped in JSON.stringify

    //    if (!converted) return;

    // Create screen-reader friendly plaintext
    const altText = document.createElement("div");
    altText.textContent = "Plaintext: " + converted;
    altText.setAttribute("data-generated", "true");
    altText.style.color = "crimson";
    altText.style.fontSize = "0.9em";
    altText.style.margin = "0.3em 0 0.6em";

    // Insert below the math element
    el.insertAdjacentElement("afterend", altText);
  });
}

// Run initially
processMathElements();



// Watch the page for changes (dynamic content)
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches("math")) {
          processMathElements(node);
        } else if (node.querySelector && node.querySelector("math")) {
          processMathElements(node);
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
