import {
  instruments,
  addInstrument,
  removeInstrument,
} from "./instrument-manager.js";

function createInstrumentEntity(
  id,
  type,
  soundSource,
  effects,
  position,
  scale
) {
  // create a new A-Frame entity with the specified components
  const entityEl = document.createElement("a-entity");
  entityEl.setAttribute("id", `instrument-${id}`);
  entityEl.setAttribute("position", position);
  entityEl.setAttribute("scale", scale);

  // add the instrument and sound source components
  const instrumentComponent = type;
  const soundsourceComponent = soundSource;
  entityEl.setAttribute(instrumentComponent, "");
  entityEl.setAttribute(soundsourceComponent, "");

  // add the effect components if any are specified
  if (effects && effects.length > 0) {
    effects.forEach((effect) => {
      const effectComponent = effect;
      entityEl.setAttribute(effectComponent, "");
    });
  }

  return entityEl;
}

// add a new instrument to the onstruments aray and the scene
export function spawnInstrument(type, soundSource, effects, position, scale) {
  console.log("INSIDE SPAWN INSTRUMENT");
  const id = instruments.length;
  addInstrument(id, type, soundSource, effects, position, scale);
  const instrumentEl = createInstrumentEntity(
    id,
    type,
    soundSource,
    effects,
    position,
    scale
  );
  console.log(instrumentEl);
  document.querySelector("a-scene").appendChild(instrumentEl);
  console.log(document.querySelector("a-scene"));
  // connect effects to synth or sampler if exists within the same entity
  const synthEl = instrumentEl.components.synth;
  if (synthEl) {
    setTimeout(() => {
      const samplerEl = instrumentEl.components.sampler;
      initAddEffects(synthEl, samplerEl, effects, instrumentEl);
    }, 0);
  }
  return instrumentEl.getAttribute("id");
}

// used to add effects during the initial spawning of an instruemnt and called within spawnInstrument()
function initAddEffects(synthEl, samplerEl, effects, instrumentEl) {
  effects.forEach((effect) => {
    console.log(effect);

    const effectEl = instrumentEl.components[effect];
    console.log(effectEl);
    if (effectEl && (synthEl || samplerEl)) {
      const audioNode = synthEl ? synthEl.getSynth() : samplerEl.getSampler();

      effectEl.connect(audioNode);
    }
  });
}
