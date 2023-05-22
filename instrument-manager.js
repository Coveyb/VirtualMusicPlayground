
 export const instruments = [];

// generates a unique id so that the new instrument element can be accessed by wrist menu 
function generateId(type, soundSource, effects = []) {
  const typeString = type || "";
  const soundSourceString = soundSource || "";
  const effectsString = Array.isArray(effects)
    ? effects.map((effect) => `${effect.type}_${effect.data}`).join("")
    : "";
  const idString = `${typeString}_${soundSourceString}_${effectsString}`;


  return idString;
}


export function addInstrument(
  type,
  soundSource,
  effects = [],
  position = { x: 0, y: 0, z: 0 },
  scale = { x: 1, y: 1, z: 1 }
) {
  // generate a unique ID for the new instrument
  const id = generateId(type, soundSource, effects);
  
  // add the new instrument to the instruments array
  const newInstrument = { id, type, soundSource, effects, position, scale };
  instruments.push(newInstrument);
  // create a new A-Frame entity for the instrument
  const instrumentEl = document.createElement("a-entity");
  // set the attributes of the instrument entity
  instrumentEl.setAttribute("instrument", { id, type, soundSource, effects });
  // set the position of the instrument entity
  instrumentEl.setAttribute("position", position);
  // set the scale of the instrument entity
  instrumentEl.setAttribute("scale", scale);
  // get the scene element
  const sceneEl = document.querySelector("a-scene");
  // add the new instrument entity to the scene
  sceneEl.appendChild(instrumentEl);
}



export function removeInstrument(id) {
  // find the index of the instrument in the instruments array
  const index = instruments.findIndex((i) => i.id === id);
  // remove the instrument from the instrument sarray
  instruments.splice(index, 1);
  // find the corresponding a-frame entity
  const instrumentEl = document.getElementById(id);

 
  // remove the instrument entity from the scene
  instrumentEl.parentNode.removeChild(instrumentEl);
}

function updateEffects(id, effects) {
  // find the instrument in the instruments array
  const instrument = instruments.find((i) => i.id === id);
  // update the effects of the instrument
  instrument.effects = effects;
  // find the corresponding a-frame entity
  const instrumentEl = document.querySelector(
    `[instrument][instrument-id="${id}"]`
  );
  // update the attributes of the instrument entity
  instrumentEl.setAttribute("instrument", {
    id,
    type: instrument.type,
    soundSource: instrument.soundSource,
    effects: instrument.effects,
  });
}
