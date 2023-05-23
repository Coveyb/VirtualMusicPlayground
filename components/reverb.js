AFRAME.registerComponent("reverb", {
  schema: {
    type: { type: "string", default: "room" },
  },

  presets: {
    room: new Tone.JCReverb(0.2),
    hall: new Tone.JCReverb(0.4),
    church: new Tone.JCReverb(0.6),
    vikingVerb: new Tone.Freeverb(),
  },

  init: function () {
    this.reverb = this.presets[this.data.type] || this.presets.room;
    console.log(this.reverb);

    this.reverb.connect(Tone.getDestination());
  },

  update: function (oldData) {
    if (oldData.type !== this.data.type) {
      this.setReverbType(this.data.type);
    }
  },

  setReverbType: function (type) {
    const preset = this.presets[type];
    if (!preset) {
      console.warn(`Unknown reverb type: ${type}`);
      return;
    }

    this.reverb = preset;
  },

  connect: function (node) {
    node.connect(this.reverb);
    console.log("WITHIN CONNECT REVERB", node);
  },

  disconnect: function (node) {
    node.disconnect(this.reverb);
  },
});
