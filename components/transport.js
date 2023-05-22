AFRAME.registerComponent('transport', {
  schema: {
    bpm: {type: 'number', default: 120},
  },

  init: function () {
    this.setBpm(this.data.bpm);
    // this.start();
  },

  update: function (oldData) {
    if (oldData.bpm !== this.data.bpm) {
      this.setBpm(this.data.bpm);
    }
  },

  setBpm: function (bpm) {
    Tone.Transport.bpm.value = bpm;
  },

  start: function () {
    Tone.Transport.start();
  },

  stop: function () {
    Tone.Transport.stop();
  },
});
