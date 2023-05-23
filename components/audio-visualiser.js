AFRAME.registerComponent("audio-visualiser", {
  schema: {
    gridSize: { type: "number", default: 10 },
    cubeSize: { type: "number", default: 4 },
    bpm: { type: "number", default: Tone.Transport.bpm.value },
    startHue: { type: "number", default: 160 },
  },

  init: function () {
    this.analyzer = new Tone.FFT(32);
    Tone.Master.connect(this.analyzer);
    this.cubes = [];
    this.hue = this.data.startHue;

    for (let x = 0; x < this.data.gridSize; x++) {
      for (let y = 0; y < this.data.gridSize; y++) {
        const cube = document.createElement("a-box");
        cube.setAttribute("position", {
          x: x * this.data.cubeSize,
          y: 0,
          z: y * this.data.cubeSize,
        });
        cube.setAttribute("width", this.data.cubeSize);
        cube.setAttribute("height", this.data.cubeSize);
        cube.setAttribute("depth", this.data.cubeSize);
        cube.setAttribute("opacity", 0.75);

        this.el.appendChild(cube);
        this.cubes.push({
          el: cube,
          // assign each cube a base hue based on its position to give the diagnonal effect
          baseHue: ((x + y) / (this.data.gridSize * 2)) * 360,
        });
      }
    }

    this.runLightShow();
  },

  tick: function () {
    // use the tone.js analyzer to store the current frequency data
    const frequencyData = this.analyzer.getValue();

    // iterate over all the cubes,the frequencyData is used to manipulate the scale of the cubes one by one based on the frequency
    for (let i = 0; i < this.cubes.length; i++) {
      // split the frequncy data over the number of cubes one by one, and storing the value
      const value = frequencyData[i % frequencyData.length];
      // process the value using math.max to appropiately represent the frequency using the adjusted scale on the y axis
      const scale = Math.max(0, (value + 140) / 100);
      this.cubes[i].el.setAttribute("scale", { x: 1, y: scale, z: 1 });
    }
  },

  runLightShow: function () {
    // set a new interval based on the bpm to give it a somewhat rhytmical effect
    this.lightShowInterval = setInterval(() => {
      // set the cube colour one by one, using the getNextColour method and passing in the baseHue as a starting point
      for (let i = 0; i < this.cubes.length; i++) {
        const cube = this.cubes[i].el;
        const color = this.getNextColour(this.cubes[i].baseHue);
        cube.setAttribute("color", color);
      }
      this.hue = (this.hue + 2) % 360;
    }, ((60 / this.data.bpm) * 1000) / 4);
  },

  getNextColour: function (baseHue) {
    // calculate the hue for the cube based on the base hue and current hue values
    const hue = (baseHue + this.hue) % 360;
    // return the color value in HSL format with fixed saturation and lightness values
    return `hsl(${hue}, 70%, 50%)`;
  },
});
