AFRAME.registerComponent("toggle-wrist-menu", {
  init: function () {
    this.el.sceneEl.addEventListener("ybuttondown", (event) =>
      this.onButtonDown(event)
    );
    this.el.sceneEl.addEventListener("ybuttonup", (event) =>
      this.onButtonUp(event)
    );
  },

  onButtonDown: function (event) {
    console.log("y button pressed");
    const wristMenu = document.querySelector("#wrist-menu");
    const isVisible = wristMenu.getAttribute("visible");

    // toggle the visibility of the wrist menu
    wristMenu.setAttribute("visible", !isVisible);
  },

  remove: function () {
    this.el.sceneEl.removeEventListener("buttondown", this.onButtonDown);
    this.el.sceneEl.removeEventListener("buttonup", this.onButtonUp);
  },
});
