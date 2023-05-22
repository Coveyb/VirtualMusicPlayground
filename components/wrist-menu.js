import {
  cycleThroughList,
  adjustSliderValue,
  createMenuButtons,
  emitMenuConfigUpdate,
  createButton,
} from "../utils/menu-utils.js";

import { presets } from "../config/presets.js";
import { samples } from "../config/samples.js";
import { spawnInstrument } from "../instrument-spawner.js";

// calculates a new rotation on the y axis
function rotateBy(degrees, currentRotation) {
  const newYRotation = (currentRotation.y + degrees) % 360;
  return { x: currentRotation.x, y: newYRotation, z: currentRotation.z };
}

// calculates a new position in for either x or z axis
function moveBy(amount, currentPosition, axis) {
  const newPosition = { ...currentPosition };
  switch (axis) {
    case "x":
      newPosition.x += amount;
      break;
    case "z":
      newPosition.z += amount;
      break;
    default:
      break;
  }
  return newPosition;
}

// takes the custom built instrument from nextInstrumentBuilder and spawns into the scene, using the position of the controller
function handleSpawnClick(event, controllerEl, nextInstrumentBuilder) {
  console.log(event);

  // spawn the instrument

  const position = controllerEl.object3D.position;
  const instrumentType = nextInstrumentBuilder[0];
  const soundSourceType = nextInstrumentBuilder[1];
  const effect1 = nextInstrumentBuilder[2];
  const effect2 = nextInstrumentBuilder[3];

  const effects = [];
  if (effect1 !== "none") {
    effects.push(effect1);
  }
  if (effect2 !== "none") {
    effects.push(effect2);
  }
  console.log(
    `Spawning instrument at (${position.x}, ${position.y}, ${position.z})`
  );
  return spawnInstrument(
    instrumentType,
    soundSourceType,
    effects,
    position,
    "1 1 1"
  );
}

function setMenuPositionAndRotation(controllerEl, menu) {
  // grab the current position of the controller
  const handPosition = controllerEl.object3D.position;

  // create an offset vector, apply the controller's rotation
  const direction = new THREE.Vector3(0.25, -0.1, 0).applyQuaternion(
    controllerEl.object3D.quaternion
  );
  // ddd rotated offset to the controller's position for the menu's position
  const offsetPosition = new THREE.Vector3().addVectors(
    handPosition,
    direction
  );
  // set the menu's position
  menu.object3D.position.set(
    offsetPosition.x,
    offsetPosition.y,
    offsetPosition.z
  );
  // create an Euler offset for rotation
  const offsetRotation = new THREE.Euler(180, 0, 0);

  // convert Euler offset to a quaternion
  const offsetQuaternion = new THREE.Quaternion().setFromEuler(offsetRotation);

  // apply rotational offset to the controller's rotation
  const menuQuaternion = new THREE.Quaternion()
    .copy(controllerEl.object3D.quaternion)
    .multiply(offsetQuaternion);

  // convert quaternion to Euler for final menu rotation
  const menuRotation = new THREE.Euler().setFromQuaternion(menuQuaternion);

  // set the menu's rotation
  menu.object3D.rotation.copy(menuRotation);
}

AFRAME.registerComponent("wrist-menu", {
  schema: {
    hand: { type: "string", default: "left" },
    currentPage: { type: "string", default: "page2" },
    rows: { type: "number", default: 2 },
    columns: { type: "number", default: 6 },
    instrumentId: { type: "string", default: "empty" },
    instruments: { type: "array" },
    nextInstrumentBuilder: {
      type: "array",
      default: ["virtual-keyboard", "synth", "none", "none"],
    },
  },

  init: function () {
    const data = this.data;
    const el = this.el;
    const sceneEl = document.querySelector("a-scene");
    const controllerEl = sceneEl.querySelector("#hand-left");
    this.instrumentEl = document.querySelector(`#${this.data.instrumentId}`);
    let currentIndex = data.instruments.indexOf(this.instrumentEl);

    // function for creating preset / sample submenu object
    function createGridButtons(
      choices,
      columns,
      buttonWidth,
      buttonHeight,
      gap,
      callback
    ) {
      const choiceNames = Object.keys(choices);
      const rows = Math.ceil(choiceNames.length / columns);

      return choiceNames.map((name, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;

        const x = -0.12 + col * (buttonWidth + gap);
        const y = 0.0375 - row * (buttonHeight + gap / rows);

        return {
          id: name,
          text: name,
          secondaryText:"",
          position: `${x} ${y} 0`,
          width: "0.08",
          height: "0.025",
          depth: "0.005",
          color: "#000000",
          textColor: "#FFFFFF",
          textWidth: "0.18",
          textZOffset: "0.03",
          wireframe: "false",
          gridPos: [col, row],
          callback: () => {
            callback(name);
          },
        };
      });
    }
    // call createGridButtons to create preset sub menu
    const presetButtons = createGridButtons(
      presets,
      3,
      0.08,
      0.025,
      0.04,
      (name) => {
        this.instrumentEl.components.synth.updatePreset(name);
        console.log("CHANGING PRESET", name);
      }
    );
    //call createGridButtons to create sample sub menu
    const sampleChoiceButtons = createGridButtons(
      samples,
      2,
      0.08,
      0.025,
      0.04,
      (name) => {
        console.log("Button clicked:", name);
        this.instrumentEl.components.sampler.updateProperty("samples", name);
      }
    );

    // object containing an array of pages(page1&page2), each page containing an object with buttton configs, each contans a callback function
    const pages = {
      page1: [
        {
          id: "switchInstrument",
          position: "0 0.085 0",
          width: "0.085",
          height: "0.035",
          depth: "0.005",
          color: "#000C66",
          wireframe: "true",
          textColor: "black",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Switch\nInstrument",
          secondaryText: data.instrumentId,
          gridPos: [-1, 0],
          callback: (id) => {
            currentIndex = (currentIndex + 1) % data.instruments.length;
            console.log(data.instruments[currentIndex].id);
            data.instrumentId = data.instruments[currentIndex].id;
            document
              .querySelector(`#${id}text`)
              .setAttribute("value", data.instrumentId);
            this.el.innerHTML = "";
            this.init();
          },
        },

        {
          id: "octaveDown",
          position: "-0.07 0.085 0",
          width: "0.045",
          height: "0.035",
          depth: "0.005",
          color: "#000C66",
          wireframe: "true",
          textColor: "black",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Octave\nDown",
          secondaryText: "",
          gridPos: [-1, 0],
          callback: (id) => {
            this.instrumentEl.components["virtual-keyboard"].octaveDown();
          },
        },
        {
          id: "octaveUp",
          position: "0.07 0.085 0",
          width: "0.045",
          height: "0.035",
          depth: "0.005",
          color: "#000C66",
          wireframe: "true",
          textColor: "black",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Octave\nUp",
          secondaryText: "",
          gridPos: [-1, 0],
          callback: (id) => {
            this.instrumentEl.components["virtual-keyboard"].octaveUp();
          },
        },
        {
          id: "filterType",
          position: "-0.15 0.015 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          wireframe: "false",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Filter\nType",
          secondaryText: "",
          gridPos: [0, 0],
          callback: (id) => {
            console.log("filterSelector");
            const filterTypes = ["lowpass", "highpass", "bandpass", "allpass"];

            const currentType =
              this.instrumentEl.getAttribute("synth").filterType;
            console.log(currentType);

            cycleThroughList(
              id,
              this.instrumentEl,
              filterTypes,
              currentType,
              this.instrumentEl.components.synth.updateProperty
            );
            console.log(this.instrumentEl.components.synth.updateProperty);
          },
        },
        {
          id: "detune",
          position: "-0.090 0.015 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.23",
          textZOffset: "0.03",
          text: "Detune",
          secondaryText: "",

          wireframe: "false",
          gridPos: [0, 1],
          slider: true,
          callback: (yValue, id) => {
            adjustSliderValue(
              id,
              -1200,
              1200,
              this.instrumentEl,
              yValue,
              25,
              this.instrumentEl.components.synth.updateProperty
            );
          },
        },

        {
          id: "filterFrequency",
          position: "-0.15 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Filter\nFrequency",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 0],
          slider: true,
          callback: (yValue, id) => {
            console.log("filterFreq");
            adjustSliderValue(
              id,
              -1,
              150,
              this.instrumentEl,
              yValue,
              5,
              this.instrumentEl.components.synth.updateProperty
            );
          },
        },

        {
          id: "resonance",
          position: "-0.090 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.23",
          textZOffset: "0.03",
          text: "Resonance",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 1],
          slider: true,
          callback: (yValue, id) => {
            console.log("resonance");
            adjustSliderValue(
              id,
              0.0001,
              14.5,
              this.instrumentEl,
              yValue,
              0.1,
              this.instrumentEl.components.synth.updateProperty
            );
          },
        },

        {
          id: "nxt",
          position: "0.163 0.015 0.003",
          width: "0.022",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          text: "Next\nPage",
          secondaryText: "",
          textWidth: "0.17",
          textZOffset: "0.03",
          wireframe: "false",
          gridPos: [0, 5],

          callback: () => {
            this.data.currentPage =
              this.data.currentPage === "page1" ? "page2" : "page1";
            this.el.innerHTML = "";
            this.init();
          },
        },
        {
          id: "presetSampleSubMenu",
          position: "0.105 0.015 0.003",
          width: "0.08",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Browse\nPresets/Samples",
          secondaryText: "",
          wireframe: "false",
          gridPos: [0, 4],
          callback: () => {
            if (this.instrumentEl.components.synth) {
              // Switch to the preset submenu
              this.data.currentPage = "presetButtons";
            } else if (this.instrumentEl.components.sampler) {
              // Switch to the sample submenu
              this.data.currentPage = "sampleChoiceButtons";
            }
            this.el.innerHTML = "";
            this.init();
          },
        },
        {
          id: "oscillatorType",
          position: "-0.030 0.015 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.23",
          text: "Select\nOscillator\nType",
          secondaryText: "",
          textZOffset: "0.03",
          wireframe: "false",
          gridPos: [0, 2],

          callback: (id) => {
            const waveTypes = ["sine", "square", "triangle", "sawtooth"];
            const currentType =
              this.instrumentEl.getAttribute("synth").oscillatorType;
            console.log(currentType);

            cycleThroughList(
              id,
              this.instrumentEl,
              waveTypes,
              currentType,
              this.instrumentEl.components.synth.updateProperty
            );
          },
        },
        {
          id: "transportStart",
          position: "0.030 0.015 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Start\nTransport",
          secondaryText: "",
          wireframe: "false",
          gridPos: [0, 3],
          callback: () => {
            Tone.Transport.start();
          },
        },

        {
          id: "attack",
          position: "-0.030 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.23",
          textZOffset: "0.03",
          text: "Attack",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 2],
          slider: true,
          callback: (yValue, id) => {
            console.log(this.instrumentEl);
            adjustSliderValue(
              id,
              0,
              5,
              this.instrumentEl,
              yValue,
              0.05,
              this.instrumentEl.components.synth.updateProperty
            );
          },
        },

        {
          id: "sustain",
          position: "0.030 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.23",
          textZOffset: "0.03",
          wireframe: "false",
          text: "Sustain",
          secondaryText: "",
          gridPos: [1, 3],
          slider: true,
          callback: (yValue, id) => {
            console.log("sustain");
            adjustSliderValue(
              id,
              0,
              1,
              this.instrumentEl,
              yValue,
              0.015,
              this.instrumentEl.components.synth.updateProperty
            );
          },
        },

        {
          id: "decay",
          position: "0.090 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          textWidth: "0.23",
          textZOffset: "0.03",
          text: "Decay",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 4],
          slider: true,
          callback: (yValue, id) => {
            console.log("decay");
            adjustSliderValue(
              id,
              0,
              5,
              this.instrumentEl,
              yValue,
              0.05,
              this.instrumentEl.components.synth.updateProperty
            );
          },
        },

        {
          id: "release",
          position: "0.150 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#000C66",
          textColor: "#FFFFFF",
          text: "Release",
          secondaryText: "",
          textWidth: "0.23",
          textZOffset: "0.03",
          wireframe: "false",
          slider: true,
          gridPos: [1, 5],
          callback: (yValue, id) => {
            console.log("release");
            adjustSliderValue(
              id,
              0,
              5,
              this.instrumentEl,
              yValue,
              0.05,
              this.instrumentEl.components.synth.updateProperty
            );
          },
        },
      ],
      page2: [
        {
          id: "instrumentSelect",
          position: "-0.15 0.015 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          text: "Select\nInstrument",
          secondaryText: "",
          textWidth: "0.22",
          textZOffset: "0.03",
          wireframe: "false",
          gridPos: [0, 0],
          callback: (id) => {
            if (this.data.nextInstrumentBuilder[0] === "virtual-keyboard") {
              this.data.nextInstrumentBuilder[0] = "sequencer";
            } else if (this.data.nextInstrumentBuilder[0] === "sequencer") {
              this.data.nextInstrumentBuilder[0] = "virtual-keyboard";
            }
            document
              .querySelector(`#${id}text`)
              .setAttribute("value", this.data.nextInstrumentBuilder[0]);
          },
        },
        {
          id: "soundSourceSelect",
          position: "-0.090 0.015 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          text: "Select\nSound\nSource",
          secondaryText: "",
          textWidth: "0.22",
          textZOffset: "0.03",
          wireframe: "false",
          gridPos: [0, 1],
          callback: (id) => {
            if (this.data.nextInstrumentBuilder[1] === "synth") {
              this.data.nextInstrumentBuilder[1] = "sampler";
            } else if (this.data.nextInstrumentBuilder[1] === "sampler") {
              this.data.nextInstrumentBuilder[1] = "synth";
            }
            document
              .querySelector(`#${id}text`)
              .setAttribute("value", this.data.nextInstrumentBuilder[1]);
          },
        },
        {
          id: "spawn-instrument",
          position: "0.105 0.015 0.003",
          width: "0.08",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          wireframe: "false",
          text: "Spawn\nInstrument",
          secondaryText: "",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          gridPos: [0, 4],
          callback: (event) => {
            console.log("spawn-instrument1");
            this.data.instrumentId = handleSpawnClick(
              event,
              this.controllerEl,
              this.data.nextInstrumentBuilder
            );
            const currentInstrument = document.querySelector(
              `#${this.data.instrumentId}`
            );
            if (currentInstrument != null) {
              this.data.instruments.push(
                document.querySelector(`#${this.data.instrumentId}`)
              );
              this.el.innerHTML = "";
              this.init();
            }
          },
        },
        {
          id: "selectEffect1",
          position: "-0.030 0.015 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.23",
          text: "Select\nEffect\n1",
          secondaryText: "",
          textZOffset: "0.03",
          wireframe: "false",
          gridPos: [0, 2],

          callback: (id) => {
            const effectsSequence = [
              "none",
              "reverb",
              "delay",
              "autofilter-lfo",
            ];

            const currentIndex = effectsSequence.indexOf(
              this.data.nextInstrumentBuilder[2]
            );
            const nextIndex = (currentIndex + 1) % effectsSequence.length;
            this.data.nextInstrumentBuilder[2] = effectsSequence[nextIndex];

            document
              .querySelector(`#${id}text`)
              .setAttribute("value", this.data.nextInstrumentBuilder[2]);
          },
        },
        {
          id: "selectEffect2",
          position: "0.030 0.015 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.23",
          textZOffset: "0.03",
          text: "Select\nEffect\n2",
          secondaryText: "",
          wireframe: "false",
          gridPos: [0, 3],
          callback: (id) => {
            const effectsSequence = [
              "none",
              "reverb",
              "delay",
              "autofilter-lfo",
            ];

            const currentIndex = effectsSequence.indexOf(
              this.data.nextInstrumentBuilder[3]
            );
            const nextIndex = (currentIndex + 1) % effectsSequence.length;
            this.data.nextInstrumentBuilder[3] = effectsSequence[nextIndex];

            document
              .querySelector(`#${id}text`)
              .setAttribute("value", this.data.nextInstrumentBuilder[3]);
          },
        },

        {
          id: "rotateLeft",
          position: "-0.030 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Rotate\nLeft",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 2],
          slider: false,
          callback: () => {
            let currentRotation = this.instrumentEl.getAttribute("rotation");
            this.instrumentEl.setAttribute(
              "rotation",
              rotateBy(45, currentRotation)
            );
          },
        },

        {
          id: "rotateRight",
          position: "0.030 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Rotate\nRight",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 3],
          slider: false,
          callback: () => {
            let currentRotation = this.instrumentEl.getAttribute("rotation");
            this.instrumentEl.setAttribute(
              "rotation",
              rotateBy(-45, currentRotation)
            );
          },
        },

        {
          id: "moveForward",
          position: "0.090 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Move\nForward",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 4],
          slider: false,
          callback: () => {
            let currentPosition = this.instrumentEl.getAttribute("position");
            this.instrumentEl.setAttribute(
              "position",
              moveBy(0.1, currentPosition, "z")
            );
          },
        },

        {
          id: "moveBackward",
          position: "0.150 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Move\nBack",
          secondaryText: "",
          wireframe: "false",
          slider: false,
          gridPos: [1, 5],
          callback: () => {
            let currentPosition = this.instrumentEl.getAttribute("position");
            this.instrumentEl.setAttribute(
              "position",
              moveBy(-0.1, currentPosition, "z")
            );
          },
        },
        {
          id: "moveLeft",
          position: "-0.15 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Move\nLeft",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 0],
          slider: false,
          callback: () => {
            let currentPosition = this.instrumentEl.getAttribute("position");
            this.instrumentEl.setAttribute(
              "position",
              moveBy(-0.1, currentPosition, "x")
            );
          },
        },

        {
          id: "moveRight",
          position: "-0.090 -0.072 0.003",
          width: "0.05",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Move\nRight",
          secondaryText: "",
          wireframe: "false",
          gridPos: [1, 1],
          slider: false,
          callback: () => {
            let currentPosition = this.instrumentEl.getAttribute("position");
            this.instrumentEl.setAttribute(
              "position",
              moveBy(0.1, currentPosition, "x")
            );
          },
        },
        {
          id: "back",
          position: "0.163 0.015 0.003",
          width: "0.022",
          height: "0.08",
          depth: "0.005",
          color: "#800080",
          textColor: "#FFFFFF",
          textWidth: "0.22",
          textZOffset: "0.03",
          text: "Back",
          secondaryText: "",
          wireframe: "false",
          gridPos: [0, 5],
          callback: () => {
            this.data.currentPage =
              this.data.currentPage === "page1" ? "page2" : "page1";
            this.el.innerHTML = "";
            this.init();
          },
        },
      ],
    };

    // add the preset and sample sub menu to pages object.
    pages.presetButtons = presetButtons;
    pages.sampleChoiceButtons = sampleChoiceButtons;

    if (!controllerEl) {
      return;
    }

    this.controllerEl = controllerEl;

    const menuUi = document.createElement("a-entity");
    menuUi.setAttribute("id", "menuUi");
    el.appendChild(menuUi);

    createMenuButtons(menuUi, pages[data.currentPage], this.instrumentEl);

    const homeButton = document.createElement("a-box");
    homeButton.setAttribute("id", "background");
    homeButton.setAttribute("scale", "0.035 0.035 -0.00001");
    homeButton.setAttribute("position", "0 0.13 0");
    homeButton.setAttribute("color", "#191970");
    homeButton.setAttribute("class", "clickable");
    homeButton.setAttribute("text", {
      value: "HOME",
      color: "#FFFFFF",
      zOffset: 0.03,
      align: "center",
      letterSpacing: 1.45,
    });

    homeButton.addEventListener("click", () => {
      this.data.currentPage = this.data.currentPage = "page1";
      this.el.innerHTML = "";
      this.init();
    });

    const homeButtonText = document.createElement("a-text");
    homeButtonText.setAttribute("value", "HOME");
    homeButtonText.setAttribute("color", "#FFFFFF");
    homeButtonText.setAttribute("align", "center");
    homeButtonText.setAttribute("letter-spacing", "1.45");
    homeButtonText.setAttribute("position", "0 0 0.05");

    homeButton.appendChild(homeButtonText);

    const bg = document.createElement("a-box");
    menuUi.appendChild(bg);
    menuUi.appendChild(homeButton);

    bg.setAttribute("id", "background");
    bg.setAttribute("scale", "0.37 -0.177 -0.00001");
    bg.setAttribute("position", "0 -0.028 0");
    bg.setAttribute("color", "#36454F");

    emitMenuConfigUpdate(
      this.data.rows,
      this.data.columns,
      "#wrist-menu",
      pages
    );
  },

  tick: function () {
    // tracks the menu to the controller
    setMenuPositionAndRotation(this.controllerEl, this.el);
  },
});
