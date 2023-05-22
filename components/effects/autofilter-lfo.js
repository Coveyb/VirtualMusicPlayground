AFRAME.registerComponent("autofilter-lfo", {
  schema: {
    frequency: { type: "number", default: 1 },
    type: { type: "string", default: "sine" },
    depth: { type: "number", default: 1 },
    baseFrequency: { type: "number", default: 200 },
    octaves: { type: "number", default: 2.5 },
    filterType: { type: "string", default: "lowpass" },
    rolloff: { type: "number", default: -12 },
    wet: { type: "number", default: 1 },
  },

  init: function () {
    this.filter = new Tone.AutoFilter(this.data.frequency).start();
    this.filter.type = this.data.filterType;
    this.filter.rolloff = this.data.rolloff;
    this.filter.wet.value = this.data.wet;

    this.lfo = this.filter.frequency;
    this.lfo.type = this.data.type;
    this.lfo.min = this.data.baseFrequency;
    this.lfo.max = this.data.baseFrequency * Math.pow(2, this.data.octaves);
    this.lfo.amplitude.value = this.data.depth;

    this.filter.chain(this.lfo, Tone.Destination);
  },

  update: function (oldData) {
    if (oldData.frequency !== this.data.frequency) {
      this.filter.frequency.value = this.data.frequency;
    }

    if (oldData.type !== this.data.type) {
      this.lfo.type = this.data.type;
    }

    if (oldData.depth !== this.data.depth) {
      this.lfo.amplitude.value = this.data.depth;
    }

    if (oldData.baseFrequency !== this.data.baseFrequency) {
      this.lfo.min = this.data.baseFrequency;
      this.lfo.max = this.data.baseFrequency * Math.pow(2, this.data.octaves);
    }

    if (oldData.octaves !== this.data.octaves) {
      this.lfo.max = this.data.baseFrequency * Math.pow(2, this.data.octaves);
    }

    if (oldData.filterType !== this.data.filterType) {
      this.filter.type = this.data.filterType;
    }

    if (oldData.rolloff !== this.data.rolloff) {
      this.filter.rolloff = this.data.rolloff;
    }

    if (oldData.wet !== this.data.wet) {
      this.filter.wet.value = this.data.wet;
    }
  },

  connect: function (node) {
    node.connect(this.filter);
  },

  disconnect: function (node) {
    node.disconnect(this.filter);
  },
});
