import { createButton, createMenuButtons } from "../utils/menu-utils.js";
import { updateAndShowText } from "../utils/ui-utils.js";
import { removeInstrument } from "../instrument-manager.js";

// constants for calculating musical notes
const OCTAVE = 12;
const MAJOR_THIRD = 4;
const MINOR_THIRD = 3;
const FIFTH = 7;
const MAJOR_SEVENTH = 11;
const MINOR_SEVENTH = 10;

// converts a note to a corrosponding integer
function noteStringToInteger(noteString) {
  const noteValues = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  const noteName = noteString.slice(0, -1);
  const octave = parseInt(noteString.slice(-1));

  return noteValues[noteName] + octave * OCTAVE;
}

// converts note integer to a note (string)
function noteIntegerToString(noteInt) {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  const octave = Math.floor(noteInt / OCTAVE);
  const noteName = noteNames[noteInt % OCTAVE];

  return noteName + octave;
}
// toggles the button colour of keyboard menu buttons, returns boolean that tracks whether the button has been toggled
function toggleButtonColor(event, isButtonActive, color) {
  const thisButton = event.target;

  isButtonActive = !isButtonActive;
  const currentColor = thisButton.getAttribute("color");
  const newColor = currentColor === "#D3D3D3" ? color : "#D3D3D3";

  thisButton.setAttribute("color", newColor);
  console.log(thisButton);

  return isButtonActive;
}

AFRAME.registerComponent("virtual-keyboard", {
  schema: {
    key: { default: "C", type: "string" },
    rootNote: { default: 60, type: "int" },
    isArpeggiating: { default: false },
    isChordMode: { default: false },
    isMotionControl: { default: false },
    is7thChord: { default: false },
    arpOctave: { default: false },
    currentlyPressedChord: { default: [] },
  },

  init: function () {
    this.scale = [];
    this.cubes = [];

    this.chordModeChord = null;
    this.arpeggiatorInterval = null;

    this.keyboardButtons = [
      {
        id: "chordMode",

        width: "0.35",
        height: "0.35",
        depth: "0.005",
        color: "#D3D3D3",

        textColor: "black",
        textWidth: "1",
        textZOffset: "0.03",
        text: "Chord Mode",
        secondaryText: "",
        wireframe: "true",

        callback: () => {
          this.data.isChordMode = toggleButtonColor(
            event,
            this.data.isChordMode,
            "blue"
          );
        },
      },
      {
        id: "7thChords",

        width: "0.35",
        height: "0.35",
        depth: "0.005",
        color: "#D3D3D3",
        wireframe: "true",
        textColor: "black",
        textWidth: "1",
        text: "7th Chord Mode",
        secondaryText: "",
        textZOffset: "0.03",
        callback: () => {
          this.data.is7thChord = toggleButtonColor(
            event,
            this.data.is7thChord,
            "purple"
          );
        },
      },
      {
        id: "arpeggiator",

        width: "0.35",
        height: "0.35",
        depth: "0.005",
        color: "#D3D3D3",
        textColor: "black",
        textWidth: "1",
        textZOffset: "0.03",
        wireframe: "true",
        class: "clickable",
        text: "Arpeggiator",
        secondaryText: "",

        callback: () => {
          this.data.isArpeggiating = toggleButtonColor(
            event,
            this.data.isArpeggiating,
            "pink"
          );
        },
      },
      {
        id: "arpOctave",

        width: "0.35",
        height: "0.35",
        depth: "0.8",
        color: "#D3D3D3",
        wireframe: "true",
        textColor: "black",
        text: "Arp + 1\nOctave",
        secondaryText: "",
        textWidth: "1",
        textZOffset: "0.03",
        callback: () => {
          this.data.arpOctave = toggleButtonColor(
            event,
            this.data.arpOctave,
            "green"
          );
        },
      },
      {
        id: "removeInstrument",

        width: "0.35",
        height: "0.35",
        depth: "0.005",
        color: "#D3D3D3",
        textColor: "black",
        text: "Remove Keyboard",
        secondaryText: "",
        textWidth: "1",
        textZOffset: "0.03",
        callback: () => {
          removeInstrument(this.el.id);
        },
      },
      {
        id: "keyUp",

        width: "0.35",
        height: "0.35",
        depth: "0.005",
        color: "#D3D3D3",
        textColor: "black",
        text: "Transpose Key Up",
        secondaryText: "",
        textWidth: "1",
        textZOffset: "0.03",
        callback: () => {
          this.cycleKey("up");
          const floatingText = document.querySelector("#floating-text");
          updateAndShowText(floatingText, `Current key is: ${this.data.key}`);
        },
      },
      {
        id: "keyDown",

        width: "0.35",
        height: "0.35",
        depth: "0.005",
        color: "#D3D3D3",
        textColor: "black",
        textWidth: "1",
        text: "Transpose Key Down",
        secondaryText: "",
        textZOffset: "0.03",
        callback: () => {
          this.cycleKey("down");
          const floatingText = document.querySelector("#floating-text");
          updateAndShowText(floatingText, `Current key is: ${this.data.key}`);
        },
      },
      {
        id: "motionControlToggle",

        width: "0.35",
        height: "0.35",
        depth: "0.005",
        color: "#D3D3D3",
        textColor: "black",
        textWidth: "1",
        text: "Motion Control Mode",
        secondaryText: "",
        textZOffset: "0.03",
        callback: () => {
          this.data.isMotionControl = toggleButtonColor(
            event,
            this.data.isMotionControl,
            "orange"
          );
        },
      },
    ];

    this.rightController = document.querySelector("#hand-right");

    this.leftController = document.querySelector("#hand-left");

    this.rightTriggerPressed = false;
    this.leftTriggerPressed = false;

    this.rightController.addEventListener("triggerdown", (e) => {
      this.rightTriggerPressed = true;
    });

    this.rightController.addEventListener("triggerup", (e) => {
      this.rightTriggerPressed = false;
      if (this.data.isArpeggiating) {
        Tone.Transport.clear(this.arpeggiatorInterval);
        this.arpeggiatorStarted = false;
      }
    });

    this.leftController.addEventListener("triggerdown", (e) => {
      this.leftTriggerPressed = true;
    });

    this.leftController.addEventListener("triggerup", (e) => {
      this.leftTriggerPressed = false;
      if (this.data.isArpeggiating) {
        Tone.Transport.clear(this.arpeggiatorInterval);
        this.arpeggiatorStarted = false;
      }
    });

    this.el.addEventListener("hit", (e) => {
      this.onHit(e);
    });
    this.el.addEventListener("hitend", (e) => {
      this.onHitEnd(e);
    });
    this.createKeyboard();
  },

  onHit: function (e) {
    const sphere = document.querySelector(`#${e.target.getAttribute("id")}`);
    const note = e.target.getAttribute("note");

    this.onAxisMove();
    if (
      (this.rightTriggerPressed || this.leftTriggerPressed) &&
      (this.data.isChordMode || this.data.isArpeggiating)
    ) {
      this.chordModeChord = this.getChordNotes(note, this.data.is7thChord, 1);
      this.data.currentlyPressedChord = this.chordModeChord;

      if (this.data.isChordMode) {
        const noteNames = this.chordModeChord.map(noteIntegerToString);
        console.log(noteNames);
        this.el.emit("noteOn", { chord: noteNames, velocity: 0.8 });
      } else if (this.data.isArpeggiating && !this.arpeggiatorStarted) {
        this.arpeggiatorStarted = true;
        this.arpeggiateChord();
      }
    } else {
      if (this.rightTriggerPressed) {
        // add animations only if they don't exist
        if (!sphere.hasAttribute("animation")) {
          const interval = Tone.Time("8n").toSeconds();
          sphere.setAttribute(
            "animation",

            {
              property: "rotation",
              to: "0 360 0",
              dur: 360,

              loop: true,
              direction: "infinity",
            }
          );
          sphere.setAttribute("scale", "1.15 1.15 1.15");
        }

        this.el.emit("noteOn", { note: note, velocity: 0.8 });

        // Send vibration to the Quest 2 controllers
        if (this.rightController) {
          const gamepad = this.rightController.components;

          if (gamepad) {
            gamepad.haptics.pulse(0.1, 100);
          }
        }
      } else if (this.leftTriggerPressed) {
        // add animations only if they don't exist
        if (!sphere.hasAttribute("animation")) {
          const interval = Tone.Time("8n").toSeconds();
          sphere.setAttribute(
            "animation",

            {
              property: "rotation",
              to: "0 360 0",
              dur: 360,

              loop: true,
              direction: "infinity",
            }
          );
          sphere.setAttribute("scale", "1.15 1.15 1.15");
        }

        this.el.emit("noteOn", { note: note, velocity: 0.8 });

        // send vibration to the Quest 2 controllers
        if (this.leftController) {
          const gamepad = this.leftController.components;

          if (gamepad) {
            gamepad.haptics.pulse(0.1, 100);
          }
        }
      } else if (!this.rightTriggerPressed) {
        if (this.data.isChordMode) {
          this.el.emit("noteOff", { releaseAll: true });
          console.log("emitting release all  -  (!triggerPressed)");
        } else {
          this.el.emit("noteOff", { note: note });
        }
        sphere.removeAttribute("animation"); // Remove the animation when the note is off
        sphere.setAttribute("scale", "1 1 1");
      } else if (!this.leftTriggerPressed) {
        if (this.data.isChordMode) {
          this.el.emit("noteOff", { releaseAll: true });
          console.log("emitting release all  -  (!triggerPressed)");
        } else {
          this.el.emit("noteOff", { note: note });
        }
        sphere.removeAttribute("animation"); // Remove the animation when the note is off
        sphere.setAttribute("scale", "1 1 1");
      }
    }
  },

  onHitEnd: function (e) {
    const sphere = document.querySelector(`#${e.target.getAttribute("id")}`);
    sphere.removeAttribute("animation");
    sphere.setAttribute("scale", "1 1 1");

    const note = e.target.getAttribute("note");
    if (this.data.isChordMode) {
      this.el.emit("noteOff", { releaseAll: true });
    } else {
      let note = e.target.getAttribute("note");

      this.el.emit("noteOff", { note: note });
      if (this.data.isArpeggiating) {
        Tone.Transport.clear(this.arpeggiatorInterval);
        this.arpeggiatorStarted = false;
      }
    }
  },

  arpeggiateChord: function (speed = "8n") {
    Tone.Transport.start();
    let octaveRange = 1;
    if (this.data.arpOctave == true) {
      octaveRange = 2;
    }
    const interval = Tone.Time(speed).toSeconds();
    const noteGap = 0.125; // gap between notes in seconds
    let index = 0;

    // create an extended chord array with multiple octaves
    let extendedChord = [];
    for (let i = 0; i < octaveRange; i++) {
      this.data.currentlyPressedChord.forEach((note) => {
        extendedChord.push(note + OCTAVE * i);
      });
    }

    this.arpeggiatorInterval = Tone.Transport.scheduleRepeat(() => {
      // Send vibration to the Quest 2 controllers
      if (this.rightController) {
        const gamepad = this.rightController.components;
        console.log(gamepad);
        if (gamepad) {
          gamepad.haptics.pulse(0.15, 50);
        }
      }

      const noteNames = extendedChord.map(noteIntegerToString);
      console.log(noteNames);
      const note = noteNames[index];

      this.el.emit("noteOn", { note, velocity: 0.8 });
      index = (index + 1) % extendedChord.length;

      Tone.Transport.scheduleOnce(() => {
        this.el.emit("noteOff", { note });
      }, `+${interval - noteGap}`);
    }, `${interval}`);
  },

  getChordNotes: function (note, includeSeventh, octaveRange) {
    const noteInt = noteStringToInteger(note);
    const notes = [];
    let chordRoot = (noteInt % OCTAVE) + Math.floor(noteInt / OCTAVE) * OCTAVE;
    let chordType = "major";

    // Determine the chord type based on the note
    switch (noteInt % OCTAVE) {
      case 0:
      case 5:
        chordType = "major";
        break;
      case 2:
      case 9:
        chordType = "minor";
        break;
    }

    // Add the root note
    notes.push(chordRoot);

    // Add the third
    if (chordType === "major") {
      notes.push(
        ((chordRoot + MAJOR_THIRD) % OCTAVE) +
          Math.floor((chordRoot + MAJOR_THIRD) / OCTAVE) * OCTAVE
      );
    } else {
      notes.push(
        ((chordRoot + MINOR_THIRD) % OCTAVE) +
          Math.floor((chordRoot + MINOR_THIRD) / OCTAVE) * OCTAVE
      );
    }

    // Add the fifth
    notes.push(
      ((chordRoot + FIFTH) % OCTAVE) +
        Math.floor((chordRoot + FIFTH) / OCTAVE) * OCTAVE
    );

    // Add the seventh if flagged
    if (includeSeventh) {
      if (chordType === "major") {
        notes.push(
          ((chordRoot + MAJOR_SEVENTH) % OCTAVE) +
            Math.floor((chordRoot + MAJOR_SEVENTH) / OCTAVE) * OCTAVE
        );
      } else {
        notes.push(
          ((chordRoot + MINOR_SEVENTH) % OCTAVE) +
            Math.floor((chordRoot + MINOR_SEVENTH) / OCTAVE) * OCTAVE
        );
      }
    }

    return notes;
  },

  //create tje keyboard and keyboard menu
  createKeyboard: function () {
    //create menu background
    let menuBg = document.createElement("a-plane");
    menuBg.setAttribute("color", "black");
    menuBg.setAttribute("geometry", "width: 2.17");
    menuBg.setAttribute("position", "1.11 0.86 0.04");
    menuBg.setAttribute("rotation", "-15.03 -89.99 0");
    menuBg.setAttribute("wireframe", "true");
    menuBg.setAttribute("scale", "1 1 0.00001");
    menuBg.setAttribute("text", {
      value: this.el.id,
      align: "center",
      letterSpacing: 1.45,
      zOffset: 0.03,
      width: 5,
      color: "black",
    });

    let buttonContainer = document.createElement("a-entity");

    buttonContainer.setAttribute(
      "layout",
      "margin: 0.45; type: box;  columns: 4; plane: xy; align: end; "
    );

    buttonContainer.setAttribute("position", "-0.68 -0.225 0");

    createMenuButtons(buttonContainer, this.keyboardButtons);

    menuBg.appendChild(buttonContainer);

    this.el.appendChild(menuBg);

    // create cubes and spheres to represent each key
    for (let i = 0; i < 7; i++) {
      let sphere = document.createElement("a-sphere");
      sphere.setAttribute("color", "black");
      sphere.setAttribute("radius", "0.1");
      sphere.setAttribute("position", { x: 0.75, y: 0.05, z: i * 0.35 - 1 });
      sphere.setAttribute("class", "playable");
      sphere.setAttribute("material", "wireframe: true;");
      sphere.setAttribute("id", `sphere${i + 1}`);

      let cube = document.createElement("a-box");
      cube.setAttribute("width", 0.5);
      cube.setAttribute("height", 0.2);
      cube.setAttribute("depth", 0.5);
      cube.setAttribute("rotation", "90 0 0");

      cube.setAttribute("color", "black");
      cube.setAttribute("position", { x: 0.75, y: 0.05, z: i * 0.35 - 1 });
      cube.setAttribute("material", "wireframe: true; width: 1; height: 1;");

      this.el.appendChild(sphere);
      this.el.appendChild(cube);

      this.cubes.push(sphere);
    }
    this.updateKey();
  },

  updateKey: function () {
    let notesInKey = this.getNotesInKey(this.data.key);

    for (let i = 0; i < 7; i++) {
      let cube = this.cubes[i];
      let note = this.data.rootNote + notesInKey[i];
      let noteName = noteIntegerToString(note);
      cube.setAttribute("note", noteName);

      console.log("update key: " + noteName);

      cube.setAttribute("text", {
        value: noteName,
        width: 1,
        height: 1,
        zOffset: 0.05,
        align: "center",
        color: "black",
      });
    }
  },

  cycleKey: function (direction) {
    const keys = [
      "C",
      "C#",
      "Db",
      "D",
      "D#",
      "Eb",
      "E",
      "F",
      "F#",
      "Gb",
      "G",
      "G#",
      "Ab",
      "A",
      "A#",
      "Bb",
      "B",
    ];
    const currentKeyIndex = keys.indexOf(this.data.key);
    let nextKeyIndex;
    if (direction === "up") {
      nextKeyIndex = (currentKeyIndex + 1) % keys.length;
    } else if (direction === "down") {
      nextKeyIndex = (currentKeyIndex - 1 + keys.length) % keys.length;
    }
    this.data.key = keys[nextKeyIndex];
    this.updateKey();
  },

  // return the notes in the selected key
  getNotesInKey: function (key) {
    switch (key) {
      case "C":
        return [0, 2, 4, 5, 7, 9, 11];
      case "C#":
        return [1, 3, 5, 6, 8, 10, 0];
      case "D":
        return [2, 4, 6, 7, 9, 11, 1];
      case "D#":
        return [3, 5, 7, 8, 10, 0, 2];
      case "E":
        return [4, 6, 8, 9, 11, 1, 3];
      case "F":
        return [5, 7, 9, 10, 0, 2, 4];
      case "F#":
        return [6, 8, 10, 11, 1, 3, 5];
      case "G":
        return [7, 9, 11, 0, 2, 4, 6];
      case "G#":
        return [8, 10, 0, 1, 3, 5, 7];
      case "A":
        return [9, 11, 1, 2, 4, 6, 8];
      case "A#":
        return [10, 0, 2, 3, 5, 7, 9];
      case "B":
        return [11, 1, 3, 4, 6, 8, 10];
      default:
        return [0, 2, 4, 5, 7, 9, 11];
    }
  },

  //rotate the right controller while plaing a note to affect the filter on the synth with motion
  // This function will be called when the controller is rotated
  onAxisMove: function () {
    if (!this.rightTriggerPressed || !this.data.isMotionControl) {
      return;
    }

    // calculate the filter frequency based on the controller rotation
    const rotation = this.rightController.object3D.rotation;
    const filterFrequency = this.calculateFilterFrequency(rotation);

    const synthComponent = this.el.components.synth;

    // update the filter frequency directly
    synthComponent.updateProperty("filterFrequency", filterFrequency);
  },
  calculateFilterFrequency: function (rotation) {
    // logic to calculate the filter frequency based on the rotation
    const frequencyRange = 3500; // 5000 Hz range
    const frequencyOffset = 50; // 50 Hz minimum frequency
    const resolution = 24;
    let normalizedRotation = (rotation.x + Math.PI) / (2 * Math.PI);
    normalizedRotation = (normalizedRotation - 0.25 + 1) % 1;
    console.log(normalizedRotation);

    const filterFrequency =
      frequencyOffset +
      Math.round(normalizedRotation * frequencyRange * resolution) / resolution;

    return filterFrequency;
  },
  // go up one octave
  octaveUp: function () {
    if (this.data.rootNote < 108) {
      this.data.rootNote += OCTAVE;
      this.updateKey();
    }
  },
  // go down one octave
  octaveDown: function () {
    if (this.data.rootNote > 0) {
      this.data.rootNote -= OCTAVE;
      this.updateKey();
    }
  },
});
