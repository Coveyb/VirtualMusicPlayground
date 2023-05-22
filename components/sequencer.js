import { removeInstrument } from "../instrument-manager.js";


// creates the  sequencer
function createSequencer(el) {
  const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
  const cubeSize = 0.5;
  const spacing = 0.6;
  const colors = [
    "#FF0000",
    "#FF7F00",
    "#baa21a",
    "#00FF00",
    "#0000FF",
    "#4B0082",
    "#9400D3",
    "#8B4513",
  ];
  // create cubes for each note and step
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 16; col++) {
      const cube = document.createElement("a-box");
      cube.setAttribute(
        "color",
        [0, 4, 8, 12].includes(col) ? "#403e3e" : "gray"
      );
      cube.setAttribute("width", cubeSize);
      cube.setAttribute("height", cubeSize);
      cube.setAttribute("class", "clickable");
      cube.setAttribute("opacity", "0.8");
      cube.setAttribute("depth", cubeSize);
      cube.setAttribute("data-note", notes[row]);
      cube.setAttribute("data-row", row);
      cube.setAttribute("data-active", false);
      cube.setAttribute("data-step", col);
      cube.setAttribute("data-color", colors[row]);

      const x = col * spacing;
      const y = row * spacing;
      const z = 0;
      cube.setAttribute("position", `${x} ${y} ${z}`);

      // add click event listener to cubes
      cube.addEventListener("click", function () {
        const isActive = JSON.parse(this.getAttribute("data-active"));

        this.setAttribute("data-active", !isActive);
        this.setAttribute(
          "color",
          isActive ? "gray" : this.getAttribute("data-color")
        );
        // update sequence data
        const note = this.getAttribute("data-note");
        const step = parseInt(this.getAttribute("data-step"));
        const row = parseInt(this.getAttribute("data-row"));

        const sequencer = el;
        const currentPattern = sequencer.components.sequencer.currentPattern;
        
        //set current seq data
        sequencer.components.sequencer.data.sequence[currentPattern][row][
          step
        ] = isActive ? 0 : 1;
      });

      el.appendChild(cube);
      el.setAttribute("position", "-2 .75 -3");
    }
  }

  // create planes for pattern bank buttons \
  function createButtons(xPosition, color, index, loadPatternFunction) {
    const pattern = document.createElement("a-plane");
    pattern.setAttribute("position", `${xPosition} 0 0`);
    pattern.setAttribute("height", 0.6);
    pattern.setAttribute("color", color);
    pattern.setAttribute("class", "clickable");
    pattern.setAttribute("opacity", 0.5);

    pattern.addEventListener("click", () => {
      loadPatternFunction(index);
    });

    return pattern;
  }

  const positions = [2.5, 0.83, -0.83, -2.5];
  const parentEntity = document.createElement("a-entity");
  // creating pattern banks
  positions.forEach((pos, index) => {
    const pattern = createButtons(
      pos,
      colors[index],
      index,
      this.loadPattern.bind(this)
    );

    parentEntity.appendChild(pattern);
  });

  const playStopButton = document.createElement("a-box");
  playStopButton.setAttribute("class", "clickable");
  playStopButton.setAttribute("position", "-1 0.8 0");
  playStopButton.setAttribute("width", "1.5");
  playStopButton.setAttribute("depth", "0.5");
  playStopButton.setAttribute("height", "0.5");
  
  const playStopButtonText = document.createElement("a-text");
playStopButtonText.setAttribute("value", "Play/Stop");
  playStopButtonText.setAttribute("position", "0 -0.015 0.3");
 playStopButtonText.setAttribute("color", "black");
playStopButtonText.setAttribute("align", "center");

playStopButton.appendChild(playStopButtonText);
  
  playStopButton.addEventListener("click", () => {
    if (!this.seqPlaying) {
      this.el.emit("playSequence");
    } else {
      this.el.emit("stopSequence");
    }
  });
  parentEntity.appendChild(playStopButton);

  const playStopAllButton = document.createElement("a-box");
  playStopAllButton.setAttribute("class", "clickable");
  playStopAllButton.setAttribute("position", "1 0.8 0");
     playStopAllButton.setAttribute("width", "1.5");
  playStopAllButton.setAttribute("depth", "0.5");
  playStopAllButton.setAttribute("height", "0.5");
  
  const playStopAllButtonText = document.createElement("a-text");
playStopAllButtonText.setAttribute("value", "Play/Stop All");
playStopAllButtonText.setAttribute("position", "0 -0.015 0.3");
  playStopAllButtonText.setAttribute("color", "black");
playStopAllButtonText.setAttribute("align", "center");

playStopAllButton.appendChild(playStopAllButtonText);
  
  playStopAllButton.addEventListener("click", () => {
    if (!this.seqPlaying) {
      this.el.sceneEl.emit("playAllSequencers");
    } else {
      this.el.sceneEl.emit("stopAllSequencers");
    }
  });
  
  
  
    const removeInstrumentButton = document.createElement("a-box");
  removeInstrumentButton.setAttribute("class", "clickable");
  removeInstrumentButton.setAttribute("position", "4.2 0.8 0");
  removeInstrumentButton.setAttribute("width", "0.5");
  removeInstrumentButton.setAttribute("depth", "0.2");
  removeInstrumentButton.setAttribute("height", "0.5");
    removeInstrumentButton.setAttribute("color", "red");


  const removeInstrumentButtonText = document.createElement("a-text");
  removeInstrumentButtonText.setAttribute("value", "X");
  removeInstrumentButtonText.setAttribute("position", "0 -0.015 0.2");
  removeInstrumentButtonText.setAttribute("color", "white");
  removeInstrumentButtonText.setAttribute("align", "center");

  removeInstrumentButton.appendChild(removeInstrumentButtonText);
    parentEntity.appendChild(removeInstrumentButton);

  removeInstrumentButton.addEventListener("click", () => {
    removeInstrument(this.el.id)
  });
  
  const instrumentIdText = document.createElement("a-text");
  instrumentIdText.setAttribute("value", this.el.id);
  instrumentIdText.setAttribute("position", "4.5 7 0");
  instrumentIdText.setAttribute("color", "black");
  instrumentIdText.setAttribute("align", "center");
  instrumentIdText.setAttribute("scale", "3 3 3");

  el.appendChild(instrumentIdText);
  
  parentEntity.appendChild(playStopAllButton);

  el.appendChild(parentEntity);
  parentEntity.setAttribute("position", "4.5 4.8 0.45");
  parentEntity.setAttribute("rotation", "17 0 0");
}
// end of create sequencer function





AFRAME.registerComponent("sequencer", {
  schema: {
    bpm: { default: Tone.Transport.bpm.value, type: "number" },
    sequence: {
      default: Array(4).fill(Array(8).fill(Array(16).fill(0))),
      type: "array",
    },
    loop: { default: true, type: "boolean" },
  },

  init: function () {
    // this prevents the audio from being disabled by browsers, there must be a click registered before sound is played
    window.addEventListener("click", () => {
      Tone.start();
    });

    this.lightShowInterval = null;
    this.currentPattern = -1;

    this.createSequencer = createSequencer.bind(this);
    this.createSequencer(this.el);

    this.currentStep = 0;
    this.seqPlaying = false;

    if (this.currentPattern === -1) {
      this.runLightShow();
    }

    // event listeners for play, stop, and pause sequence

    this.el.addEventListener("playSequence", () => {
      if (!this.seqPlaying) {
        this.seqPlaying = true;
        this.stopLightShow();
        this.playSequence();
      }
    });

    this.el.addEventListener("stopSequence", () => {
      this.seqPlaying = false;
      this.currentStep = 0;
           

    });

    

    this.el.sceneEl.addEventListener("playAllSequencers", () => {
      if (!this.seqPlaying) {
        this.seqPlaying = true;
        this.stopLightShow();
        this.playSequence();
      }
    });

    this.el.sceneEl.addEventListener("stopAllSequencers", () => {
      if (this.seqPlaying) {
        this.seqPlaying = false;
        this.currentStep = 0;
             

      }
    });
  },
// plays the programmed sequence 
  playSequence: function () {
    if (!this.seqPlaying) return;

    // play the current pattern selected from the pattern banks
    const currentPattern = this.currentPattern;
    const sequence = this.data.sequence[currentPattern];

    // update the color and play notes for the current step's cubes
    const currentStep = this.currentStep;
    for (let row = 0; row < sequence.length; row++) {
      const isActive = sequence[row][currentStep] === 1;
      const note = this.el.querySelector(
        `[data-row="${row}"][data-step="${currentStep}"]`
      );

      note.setAttribute(
        "color",
        isActive ? note.getAttribute("data-color") : "gray"
      );

      // this indicates the playhead
      note.setAttribute("color", "yellow");

      const noteName = note.getAttribute("data-note");

      // if the note is active (selected) then emit the note, 
      if (isActive) {
        // velocityOffset humanises the velocity by randomising the value slightly 
        const velocityOffset = Math.random() * 0.2;
        
        // note duration is used by setTimeout to emit the note off and determines the length of each note
        const noteDuration = (60 / this.data.bpm) * 1000 * 0.25;

        this.el.emit("noteOn", {
          note: noteName,
          velocity: 0.8 + velocityOffset,
        });

        setTimeout(() => {
          this.el.emit("noteOff", { note: noteName });
        }, noteDuration);
      }
    }

    // update the color of the previous step's cubes back to their original state
    const prevStep = this.currentStep === 0 ? 15 : this.currentStep - 1;
    const prevCubes = this.el.querySelectorAll(`[data-step="${prevStep}"]`);

    prevCubes.forEach((cube) => {
      const isActive = JSON.parse(cube.getAttribute("data-active"));
      const isBeatCube = [0, 4, 8, 12].includes(prevStep);
      cube.setAttribute(
        "color",
        isActive
          ? cube.getAttribute("data-color")
          : isBeatCube
          ? "#403e3e"
          : "gray"
      );
    });

    this.currentStep = (this.currentStep + 1) % 16;

    // call the playSequence function again after a certain delay
    const secondsPerBeat = 60 / this.data.bpm; // Duration of a beat in seconds
    const secondsPerStep = secondsPerBeat / 4; // duration of a step in seconds

    setTimeout(() => {
      this.playSequence();
    }, secondsPerStep * 1000);
  },

  loadPattern: function (patternNumber) {
    //set all cubes to inactive, and grey colour
    const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    const allCubes = this.el.querySelectorAll("[data-note][data-step]");
    allCubes.forEach((cube) => {
      cube.setAttribute("data-active", false);
      cube.setAttribute("color", "gray");
    });

    // set the current pattern based on the provided pattern number
    this.currentPattern = patternNumber;

    const sequence = this.data.sequence[this.currentPattern];

    // use the sequence data to update the cubes' active state and colour
    for (let row = 0; row < sequence.length; row++) {
      for (let col = 0; col < sequence[row].length; col++) {
        const isActive = sequence[row][col] === 1;
        const cube = this.el.querySelector(
          `[data-note="${notes[row]}"][data-step="${col}"]`
        );
        if (cube) {
          cube.setAttribute("data-active", isActive ? "true" : "false");
          cube.setAttribute(
            "color",
            isActive ? cube.getAttribute("data-color") : "gray"
          );
        }
      }
    }
    // start the Tone.Transport to play the loaded pattern
    Tone.Transport.start();
  },

  runLightShow: function () {
    // set up variables for the light show
    const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    const origin = { x: 7.5, y: 3.5 };
    const maxDistance = Math.sqrt(
      Math.pow(15 - origin.x, 2) + Math.pow(7 - origin.y, 2)
    );
    let hue = 0;
    let outwards = true;

    // start the interval for the light show
    this.lightShowInterval = setInterval(() => {
      // Cceck if the sequence is already playing or a pattern is loaded, stop the light show and start playing the sequence
      if (this.seqPlaying || this.currentPattern !== -1) {
        this.stopLightShow();
        this.seqPlaying = true;
        this.playSequence();
        return;
      }

      // update the color of each cube based on its distance from the origin
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 16; col++) {
          let distance = Math.sqrt(
            Math.pow(col - origin.x, 2) + Math.pow(row - origin.y, 2)
          );
          if (!outwards) {
            distance = maxDistance - distance;
          }

          setTimeout(() => {
            const cube = this.el.querySelector(
              `[data-step="${col}"][data-note="${notes[row]}"]`
            );
            const color = `hsl(${
              Math.floor(hue + distance * 10) % 360
            }, 100%, 50%)`;
            cube.setAttribute("color", color);
          }, distance * 500);
        }
      }

      // update the hue and color of all cubes after a certain duration
      hue = (hue + 45) % 360;

      setTimeout(() => {
        const cubes = this.el.querySelectorAll("[data-step][data-note]");
        cubes.forEach((cube) => {
          const cubeHue = parseInt(
            cube
              .getAttribute("color")
              .slice(4, cube.getAttribute("color").indexOf(","))
          );
        });
      }, 9000);

      // alternate the direction of the light show animation
      outwards = !outwards;
    }, (60 / this.data.bpm) * 10000);
  },

  
  // stops the light show, so the sequencer can be used 
  stopLightShow: function () {
    if (this.lightShowInterval) {
      clearInterval(this.lightShowInterval);
      this.lightShowInterval = null;
    }
  },
});
