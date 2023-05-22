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

  //not grabbing the right value, of detune(testing)
  const currentValue = synthEl.getAttribute("synth")[sliderId];
  console.log(currentValue + "CURRENT");

  console.log("SYNTHE L ", synthEl.getAttribute("synth")[sliderId]);

  console.log("SLIDER ID :  ", sliderId);

  let step = sensitivity;
  if (yValue > 0.7) {
    step = -sensitivity;
  } else if (yValue < -0.7) {
    step = sensitivity;
  }

  // Determine the new value based on the current value and step
  let newValue = currentValue + step;

  if (newValue < min) {
    newValue = min;
  } else if (newValue > max) {
    newValue = max;
  }
  console.log(newValue + "NEW");
  // slider.setAttribute("slider-value", newValue);
  // Pass the value to the synth element
  updateMethod.call(synthEl.components.synth, sliderId, newValue);
  // Update the slider's visual representation here
  // ...
}

export function evenlySpaceRange(start, end, numInputs) {
  let interval = (end - start) / (numInputs - 1);
  return Array.from({ length: numInputs }, (_, i) => start + i * interval);
}

export function emitMenuConfigUpdate(rows, columns, menuSelector, pages) {
  const event = new CustomEvent("menu-assigned", {
    detail: { rows, columns, menuSelector, pages },
  });
  document.querySelector(menuSelector).emit("menu-assigned", event.detail);
}

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
  button.setAttribute("opacity", "0.25");
  button.setAttribute("wireframe", wireframe);
  button.setAttribute("text", {
    value: id,
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
  text2.setAttribute("value", text);
  text2.setAttribute("align", "center");
  text2.setAttribute("position", "0 0.025 0.005");
  text2.setAttribute("width", textWidth);
  text2.setAttribute("color", "black");
  
  

  
  
  button.appendChild(text2);

  // if (text2.getAttribute("value") == undefined) {
  //     text2.setAttribute("value", " ");
  // }
  return button;
}

export function createMenuButtons(menuUi, page, synthEl) {
  page.forEach((buttonConfig) => {
    menuUi.appendChild(createButton(buttonConfig));
  });
}
