import { updateAndShowText } from "../utils/ui-utils.js";
import { presets } from "../config/presets.js";

AFRAME.registerComponent("synth", {
  schema: {
    synthType: { default: "PolySynth", type: "string" },
    oscillatorType: { default: "sine", type: "string" },
    volume: { default: -12, type: "number" },
    attack: { default: 0, type: "number" },
    decay: { default: 0.1, type: "number" },
    sustain: { default: 1, type: "number" },
    release: { default: 0.1, type: "number" },
    portamento: { default: 0, type: "number" },
    detune: { default: 0, type: "number" },
    filterType: { default: "lowpass", type: "string" },
    filterFrequency: { default: 350, type: "number" },
    filterQ: { default: 1, type: "number" },
    filterGain: { default: 0, type: "number" },
    resonance: { default: 0, type: "number" },
    harmonicity: { default: 1, type: "number" },
    oscillator: { default: "sine", type: "string" },
    modulationType: { default: "sine", type: "string" },
    modulationAttack: { default: 0, type: "number" },
    modulationDecay: { default: 0.1, type: "number" },
    modulationSustain: { default: 1, type: "number" },
    modulationRelease: { default: 0.1, type: "number" },
  },

  init: function () {
    //create the synthm, then the filter, then chain them together to send them to the master output
    this.createSynth();
    this.createFilter();
    this.synth.chain(this.filter, Tone.Destination);

    // keep track of which notes are currently being played
    this.playingNotes = {};

    this.el.addEventListener("noteOn", (e) => {
      const note = e.detail.note;
      const chord = e.detail.chord;
      const velocity = e.detail.velocity;

      if (note) {
        if (this.playingNotes[note]) {
          return;
        }

        this.playingNotes[note] = true;
        this.synth.triggerAttack(note, Tone.now(), velocity);
      } else if (chord) {
        const allNotesNotPlaying = chord.every(
          (note) => !this.playingNotes[note]
        );

        if (allNotesNotPlaying) {
          chord.forEach((note) => {
            this.playingNotes[note] = true;
          });

          this.synth.triggerAttack(chord, Tone.now(), velocity);
        } else {
        }
      }
    });

    this.el.addEventListener("noteOff", (e) => {
      const note = e.detail.note;
      const releaseAll = e.detail.releaseAll;
      console.log(releaseAll);
      if (releaseAll) {
        for (let noteName in this.playingNotes) {
          if (this.playingNotes[noteName]) {
            this.synth.triggerRelease(noteName);
            this.playingNotes[noteName] = false;
          }
        }
      }

      if (!this.playingNotes[note]) {
        // note is not currently being played, do nothing
        return;
      }

      // set the state of the note to "not playing"
      this.playingNotes[note] = false;

      // trigger the release of the specific note for PolySynth
      if (this.synth instanceof Tone.PolySynth) {
        this.synth.triggerRelease(note);
      } else {
        // trigger the release if no other notes of the same pitch are being played
        if (
          !Object.values(this.playingNotes).some(
            (state) => state && state !== note
          )
        ) {
          this.synth.triggerRelease();
        }
      }
    });
  },

  createSynth: function () {
    if (this.synth) {
      this.synth.dispose();
    }

    const synthOptions = presets["Rich Flute"];
    console.log(synthOptions);
    switch (this.data.synthType) {
      case "PolySynth":
        this.synth = new Tone.PolySynth(Tone.FMSynth, synthOptions);
        break;
      case "MonoSynth":
        this.synth = new Tone.MonoSynth(synthOptions);
        break;
      case "AMSynth":
        this.synth = new Tone.AMSynth(synthOptions);
        break;
      case "FMSynth":
        this.synth = new Tone.FMSynth(synthOptions);
        break;
      case "Synth":
        this.synth = new Tone.Synth(synthOptions);
        break;
      default:
        this.synth = new Tone.PolySynth(Tone.Synth, synthOptions);
        break;
    }
    console.log("within createSynth", this.synth);
  },

  createFilter: function () {
    if (this.filter) {
      this.filter.dispose();
    }

    const filterOptions = {
      type: this.data.filterType,
      frequency: this.data.filterFrequency,
      Q: this.data.filterQ,
      gain: this.data.filterGain,
    };

    this.filter = new Tone.Filter(filterOptions);
  },

  connect: function (effect) {
    this.synth.connect(effect);
  },

  // loads a new preset from the presets.js file
  updatePreset: function (presetKey) {
    const newPreset = presets[presetKey];
    if (!newPreset) {
      console.error(`Preset ${presetKey} not found.`);
      return;
    }

    // update each value using the for loop, calling updateProprty each time
    for (const propertyName in newPreset) {
      const propertyValue = newPreset[propertyName];

      this.updateProperty(propertyName, propertyValue);
    }
  },

  updateSynthType: function (newSynthType) {
    this.data.synthType = newSynthType;
    this.updateSynth();
  },

  updateOscillatorType: function (newOscillatorType) {
    this.data.oscillatorType = newOscillatorType;
    this.synth.set({ oscillator: { type: newOscillatorType } });
  },

  updateVolume: function (newVolume) {
    this.data.volume = newVolume;
    this.synth.set({ volume: newVolume });
  },

  updateAttack: function (newAttack) {
    this.data.attack = newAttack;
    this.synth.set({ envelope: { attack: newAttack } });
  },

  updateDecay: function (newDecay) {
    this.data.decay = newDecay;
    this.synth.set({ envelope: { decay: newDecay } });
  },

  updateSustain: function (newSustain) {
    this.data.sustain = newSustain;
    this.synth.set({ envelope: { sustain: newSustain } });
  },

  updateRelease: function (newRelease) {
    this.data.release = newRelease;
    this.synth.set({ envelope: { release: newRelease } });
  },

  updatePortamento: function (newPortamento) {
    this.data.portamento = newPortamento;
    this.synth.set({ portamento: newPortamento });
  },

  updateDetune: function (newDetune) {
    this.data.detune = newDetune;
    this.synth.set({ detune: newDetune });
  },

  updateFilterType: function (newFilterType) {
    this.data.filterType = newFilterType;
    this.filter.set({ type: newFilterType });
  },

  updateFilterFrequency: function (newFilterFrequency) {
    this.data.filterFrequency = newFilterFrequency;
    this.filter.set({ frequency: newFilterFrequency });
  },

  updateFilterQ: function (newFilterQ) {
    this.data.filterQ = newFilterQ;
    this.filter.set({ Q: newFilterQ });
  },

  updateFilterGain: function (newFilterGain) {
    this.data.filterGain = newFilterGain;
    this.filter.set({ gain: newFilterGain });
  },
  updateFilterResonance: function (newFilterResonance) {
    this.data.resonance = newFilterResonance;
    this.filter.set({ resonance: newFilterResonance });
  },
  updateHarmonicity: function (newHarmonicity) {
    this.data.harmonicity = newHarmonicity;
    this.synth.set({ harmonicity: newHarmonicity });
  },

  updateOscillator: function (newOscillator) {
    this.data.oscillator = newOscillator;
    this.synth.set({ oscillator: newOscillator });
  },

  updateModulationType: function (newModulationType) {
    this.data.modulationType = newModulationType;
    this.synth.set({ modulation: { type: newModulationType } });
  },

  updateModulationAttack: function (newModulationAttack) {
    this.data.modulationAttack = newModulationAttack;
    this.synth.set({ modulationEnvelope: { attack: newModulationAttack } });
  },

  updateModulationDecay: function (newModulationDecay) {
    this.data.modulationDecay = newModulationDecay;
    this.synth.set({ modulationEnvelope: { decay: newModulationDecay } });
  },

  updateModulationSustain: function (newModulationSustain) {
    this.data.modulationSustain = newModulationSustain;
    this.synth.set({ modulationEnvelope: { sustain: newModulationSustain } });
  },

  updateModulationRelease: function (newModulationRelease) {
    this.data.modulationRelease = newModulationRelease;
    this.synth.set({ modulationEnvelope: { release: newModulationRelease } });
  },

  // update property by taking propertyName, using the map to find the update function and using the propertyValue in the updatefunction
  updateProperty: function (propertyName, propertyValue) {
    const propertyMap = {
      synthType: { dataKey: "synthType", updateFunc: this.updateSynth },
      oscillatorType: {
        dataKey: "oscillatorType",
        updateFunc: this.updateOscillatorType,
      },
      volume: { dataKey: "volume", updateFunc: this.updateVolume },
      attack: { dataKey: "attack", updateFunc: this.updateAttack },
      decay: { dataKey: "decay", updateFunc: this.updateDecay },
      sustain: { dataKey: "sustain", updateFunc: this.updateSustain },
      release: { dataKey: "release", updateFunc: this.updateRelease },
      portamento: { dataKey: "portamento", updateFunc: this.updatePortamento },
      detune: { dataKey: "detune", updateFunc: this.updateDetune },
      filterType: { dataKey: "filterType", updateFunc: this.updateFilterType },
      filterFrequency: {
        dataKey: "filterFrequency",
        updateFunc: this.updateFilterFrequency,
      },
      filterQ: { dataKey: "filterQ", updateFunc: this.updateFilterQ },
      filterGain: { dataKey: "filterGain", updateFunc: this.updateFilterGain },
      resonance: {
        dataKey: "resonance",
        updateFunc: this.updateFilterResonance,
      },
      harmonicity: {
        dataKey: "harmonicity",
        updateFunc: this.updateHarmonicity,
      },
      oscillator: { dataKey: "oscillator", updateFunc: this.updateOscillator },
      modulationType: {
        dataKey: "modulationType",
        updateFunc: this.updateModulationType,
      },
      modulationAttack: {
        dataKey: "modulationAttack",
        updateFunc: this.updateModulationAttack,
      },
      modulationDecay: {
        dataKey: "modulationDecay",
        updateFunc: this.updateModulationDecay,
      },
      modulationSustain: {
        dataKey: "modulationSustain",
        updateFunc: this.updateModulationSustain,
      },
      modulationRelease: {
        dataKey: "modulationRelease",
        updateFunc: this.updateModulationRelease,
      },
    };

    // check if the property name exists in thr propertyMap
    if (propertyMap.hasOwnProperty(propertyName)) {
      // grab the dataKey and update function by using the property name
      const { dataKey, updateFunc } = propertyMap[propertyName];

      // call the function
      updateFunc.call(this, propertyValue);

      //grab the floating text element that is attatched to camera
      const floatingText = document.querySelector("#floating-text");

      // clear the existing timeout if there is one
      if (this.textTimeout) {
        clearTimeout(this.textTimeout);
      }
      updateAndShowText(floatingText, `${propertyName}: ${propertyValue}`);
    }
  },

  // getter for tone.js synth
  getSynth: function () {
    return this.synth;
  },
});
