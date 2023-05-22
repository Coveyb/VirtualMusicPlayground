export function updateAndShowText(textElement, newText) {
  // Set the new text
  textElement.setAttribute("value", newText);

  // Make the text visible
  textElement.setAttribute("visible", true);

  // Hide the text after 3 seconds
  setTimeout(() => {
    textElement.setAttribute("visible", false);
  }, 3000);
}
