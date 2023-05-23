// registering the delay component
AFRAME.registerComponent("delay", {
  schema: {
    type: { type: "string", default: "pingpong" },
    time: { type: "number", default: 5.25 },
    feedback: { type: "number", default: 0.5 },
    wet: { type: "number", default: 0.5 },
    taps: { type: "number", default: 6 },
    spread: { type: "number", default: 20 },
  },

  presets: {
    pingpong: Tone.PingPongDelay,
    feedback: Tone.FeedbackDelay,
    multitap: Tone.MultitapDelay,
  },

  init: function () {
    // set the delay type on init
    this.setDelayType(this.data.type);
  },

  update: function (oldData) {
    if (oldData.type !== this.data.type) {
      this.setDelayType(this.data.type);
    }

    this.setDelayParameters();
  },

  setDelayType: function (type) {
    const DelayType = this.presets[type];

    if (!DelayType) {
      console.warn(`Unknown delay type: ${type}`);
      return;
    }

    this.delay && this.delay.dispose();
    this.delay = new DelayType(this.data.time, this.data.feedback);

    if (type === "multitap") {
      this.delay = new DelayType(
        this.data.taps,
        this.data.time,
        this.data.spread
      );
    }
  },

  setDelayParameters: function () {
    this.delay.wet.value = this.data.wet;

    if (this.data.type !== "multitap") {
      this.delay.delayTime.value = this.data.time;
      this.delay.feedback.value = this.data.feedback;
    }
  },

  connect: function (node) {
    node.connect(this.delay);
  },

  disconnect: function (node) {
    node.disconnect(this.delay);
  },
});
