// used by wrist nmenu to allow the user to cycle through synth parameters such as waveform and filter type
export function cycleThroughList(id, synthEl, list, currentValue, updateFunc) {
  const currentIndex = list.indexOf(currentValue);
  const nextIndex = (currentIndex + 1) % list.length;
  const nextValue = list[nextIndex];

  if (nextValue === "off") {
    updateFunc.call(synthEl.components.synth, id, null);
  } else {
    updateFunc.call(synthEl.components.synth, id, nextValue);
  }
}
// takes input of the id of the button(slider), min and max values, the synth element, the y value from the thumbstick moving event
// along with a sensitivity value and the update method
export function adjustSliderValue(
  sliderId,
  min,
  max,
  synthEl,
  yValue,
  sensitivity,
  updateMethod
) {
  let isThumbstickMoving = false;
  if (isThumbstickMoving) {
    return;
  }
  isThumbstickMoving = true;

  setTimeout(() => {
    isThumbstickMoving = false;
  }, 150);

  const currentValue = synthEl.getAttribute("synth")[sliderId];

  let step = sensitivity;
  if (yValue > 0.7) {
    step = -sensitivity;
  } else if (yValue < -0.7) {
    step = sensitivity;
  }

  // determine the new value based on the current value and step
  let newValue = currentValue + step;

  if (newValue < min) {
    newValue = min;
  } else if (newValue > max) {
    newValue = max;
  }
  console.log(newValue + "NEW");

  // pass the value to the synth element
  updateMethod.call(synthEl.components.synth, sliderId, newValue);
}

// emits the menu config update, intended for the listener within thumbstick selector
export function emitMenuConfigUpdate(rows, columns, menuSelector, pages) {
  const event = new CustomEvent("menu-assigned", {
    detail: { rows, columns, menuSelector, pages },
  });
  document.querySelector(menuSelector).emit("menu-assigned", event.detail);
}
// create a button using the config from the pages object within wrist menu
export function createButton({
  id,
  position,
  width,
  height,
  depth,
  color,
  callback,
  wireframe,
  textColor,
  textZOffset,
  textWidth,
  text,
  secondaryText,
}) {
  const button = document.createElement("a-box");
  button.setAttribute("id", id);
  button.setAttribute("position", position);
  button.setAttribute("width", width);
  button.setAttribute("height", height);
  button.setAttribute("depth", depth);
  button.setAttribute("color", color);
  button.setAttribute("class", "clickable");
  button.setAttribute("scale", "1 1 0.005");
  button.setAttribute("opacity", "1");
  button.setAttribute("wireframe", wireframe);
  button.setAttribute("text", {
    value: text,
    align: "center",
    letterSpacing: 1.45,
    zOffset: textZOffset,
    width: textWidth,
    color: textColor,
  });
  button.addEventListener("click", () => {
    callback(id);
  });

  const text2 = document.createElement("a-text");
  text2.setAttribute("id", `${id}text`);
  text2.setAttribute("value", secondaryText);
  text2.setAttribute("align", "center");
  text2.setAttribute("position", "0 0.025 0.005");
  text2.setAttribute("width", textWidth);
  text2.setAttribute("color", "#FAD02C");

  button.appendChild(text2);

  return button;
}
// call create button for each button in the menu
export function createMenuButtons(menuUi, page, synthEl) {
  page.forEach((buttonConfig) => {
    menuUi.appendChild(createButton(buttonConfig));
  });
}
