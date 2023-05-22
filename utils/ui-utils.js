export function updateAndShowText(textElement, newText) {
  textElement.setAttribute("value", newText);
  textElement.setAttribute("visible", true);

  // hide the text after 3 seconds
  setTimeout(() => {
    textElement.setAttribute("visible", false);
  }, 3000);
}
