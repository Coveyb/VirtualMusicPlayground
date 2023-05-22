import { updateAndShowText } from "../utils/ui-utils.js";
import { samples } from "../config/samples.js";

AFRAME.registerComponent("sampler", {
  schema: {
    samples: {
      default: samples["Analog Stab"],
    },
    volume: { default: -12, type: "number" },
  },

  init: function () {
    this.createSampler();

    // keep track of which notes are currently being played
    this.playingNotes = {};

    this.el.addEventListener("noteOn", (e) => {
      const note = e.detail.note;
      console.log(note);
      const chord = e.detail.chord;
      const velocity = e.detail.velocity;

      if (note) {
        if (this.playingNotes[note]) {
          console.log("returning");
          return;
        }
        this.playingNotes[note] = true;
        this.sampler.triggerAttack(note, Tone.now(), velocity);
      } else if (chord) {
        const allNotesNotPlaying = chord.every(
          (note) => !this.playingNotes[note]
        );

        if (allNotesNotPlaying) {
          chord.forEach((note) => {
            this.playingNotes[note] = true;
          });
          this.sampler.triggerAttack(chord, Tone.now(), velocity);
        }
      }
    });

    this.el.addEventListener("noteOff", (e) => {
      console.log("NOTEOFF");
      const note = e.detail.note;
      const releaseAll = e.detail.releaseAll;

      if (releaseAll) {
        for (let noteName in this.playingNotes) {
          if (this.playingNotes[noteName]) {
            this.sampler.triggerRelease(noteName);
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

      // trigger the release of the specific note
      this.sampler.triggerRelease(note);
    });
  },

  createSampler: function () {
    if (this.sampler) {
      this.sampler.dispose();
    }

    const samples = this.data.samples;
    console.log(samples);
    this.sampler = new Tone.Sampler(samples);

    this.sampler.set({ volume: this.data.volume });
    this.sampler.connect(Tone.Destination);
  },

  updateVolume: function (newVolume) {
    this.data.volume = newVolume;
    this.sampler.set({ volume: newVolume });
  },

  updateSamples: function (newSamplesKey) {
    if (!samples.hasOwnProperty(newSamplesKey)) {
      console.error(`No sample set found with key: ${newSamplesKey}`);
      return;
    }

    this.data.samples = samples[newSamplesKey];
    // recreate the sampler with the new samples
    this.createSampler();
  },

  updateProperty: function (propertyName, propertyValue) {
    const propertyMap = {
      volume: { dataKey: "volume", updateFunc: this.updateVolume },
      samples: { dataKey: "samples", updateFunc: this.updateSamples },
    };

    if (propertyMap.hasOwnProperty(propertyName)) {
      const { dataKey, updateFunc } = propertyMap[propertyName];
      this.data[dataKey] = propertyValue;
      updateFunc.call(this, propertyValue);
      const floatingText = document.querySelector("#floating-text");

      // clear the existing timeout if there is one
      if (this.textTimeout) {
        clearTimeout(this.textTimeout);
      }
      updateAndShowText(floatingText, `${propertyName}: ${propertyValue}`);
    }
  },
  getSampler: function () {
    return this.sampler;
  },
});
