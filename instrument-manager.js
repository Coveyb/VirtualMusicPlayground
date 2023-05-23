export const instruments = [];

// add instrument to instruments array
export function addInstrument(
  id,
  type,
  soundSource,
  effects = [],
  position,
  scale
) {
  const instrumentId = `instrument-${id}`;

  // add the new instrument to the instruments array
  const newInstrument = {
    instrumentId,
    type,
    soundSource,
    effects,
    position,
    scale,
  };
  instruments.push(newInstrument);
}

// remove from array and scene
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
