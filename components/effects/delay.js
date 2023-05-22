// registering the delay component
AFRAME.registerComponent("delay", {
  schema: {
    type: { type: "string", default: "pingpong" }, // sets the type of delay
    time: { type: "number", default: 5.25 }, // Controls the delay time
    feedback: { type: "number", default: 0.5 }, // controls the amount of feedback
    wet: { type: "number", default: 0.5 }, // controls the level of the wet signal
    taps: { type: "number", default: 6 }, // controls the number of taps in the delay
    spread: { type: "number", default: 20 }, // spread of the taps (only for multitap)
  },

  presets: {
    pingpong: Tone.PingPongDelay,
    feedback: Tone.FeedbackDelay,
    multitap: Tone.MultitapDelay,
  },

  init: function () {
    // set the delay type on initialization
    this.setDelayType(this.data.type);
  },

  update: function (oldData) {
    // ff the type has changed, update the delay type
    if (oldData.type !== this.data.type) {
      this.setDelayType(this.data.type);
    }

    // update the delay parameters
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
    // connect the delay to the given node

    node.connect(this.delay);
  },

  disconnect: function (node) {
    // disconnect the delay from the given node
    node.disconnect(this.delay);
  },
});
