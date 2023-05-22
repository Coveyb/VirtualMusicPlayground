AFRAME.registerComponent("thumbstick-selector", {
  schema: {
    rows: { type: "int", default: 1 },
    columns: { type: "int", default: 1 },
    menuSelector: { type: "string", default: "" },
  },

  init: function () {
    console.log("thumbstick-selector loaded");
    this.selectedRow = 0;
    this.selectedColumn = 0;
    this.selectedSlider = null;
    this.sliderActive = false;


    this.pages = [];
    this.el.addEventListener("menu-assigned", () => {
      this.onMenuConfigUpdate(event);
      console.log(this.pages)
    });
    this.el.sceneEl.addEventListener(
      "xbuttondown",
      this.onXButtonDown.bind(this)
    );
  },

  onMenuConfigUpdate: function (event) {
    console.log(event);
    console.log("event");

    const { rows, columns, menuSelector, pages } = event.detail;
    this.updateMenuConfig(rows, columns, menuSelector, pages);
    this.el.sceneEl.addEventListener("thumbstickmoved", (event) =>
      this.onThumbstickMoved(event)
    );
  },

  onThumbstickMoved: function (evt) {
    if (this.isThumbstickMoving) {
      return;
    }
    this.isThumbstickMoving = true;

    setTimeout(() => {
      this.isThumbstickMoving = false;
    }, 100);

    const { x, y } = event.detail;
    console.log(this.sliderActive);
    // if the slider is active, adjust its value with the analog stick
    if (this.sliderActive) {
      const selectedItemConfig = this.getSelectedItem();

      if (selectedItemConfig && selectedItemConfig.slider) {
        selectedItemConfig.callback(y, selectedItemConfig.id);
      }
    } else {
      if (y < -0.8) {
        console.log("UP");
        this.selectedRow = Math.max(this.selectedRow - 1, 0);
        console.log(this.selectedRow);
      } else if (y > 0.8) {
        console.log("DOWN");
        this.selectedRow = Math.min(this.selectedRow + 1, this.data.rows - 1);
        console.log(this.selectedRow);
      }

      if (x > 0.5) {
        console.log("RIGHT");
        this.selectedColumn = Math.min(
          this.selectedColumn + 1,
          this.data.columns - 1
        );
        console.log(this.selectedColumn);
      } else if (x < -0.5) {
        console.log("LEFT");
        this.selectedColumn = Math.max(this.selectedColumn - 1, 0);
        console.log(this.selectedColumn);
      }

      this.highlightSelectedItem();
    }
  },

  getSelectedItem: function () {
    const menuItems = this.pages;
    let selectedItemConfig = null;

        const wristMenuComponent = this.el.sceneEl.querySelector('#wrist-menu').components['wrist-menu'];
const currentPage = wristMenuComponent.data.currentPage;
    
    menuItems[currentPage].forEach((itemConfig, index) => {
      const row = itemConfig.gridPos[0];
      const column = itemConfig.gridPos[1];

      if (row === this.selectedRow && column === this.selectedColumn) {
        selectedItemConfig = itemConfig;
      }
    });

    return selectedItemConfig;
  },

  highlightSelectedItem: function () {
    const selectedItemConfig = this.getSelectedItem();

    const wristMenuComponent = this.el.sceneEl.querySelector('#wrist-menu').components['wrist-menu'];
const currentPage = wristMenuComponent.data.currentPage;

    
    this.pages[currentPage].forEach((itemConfig) => {
      const item = document.querySelector(`#${itemConfig.id}`);

      if (itemConfig === selectedItemConfig) {
        if (this.sliderActive) {
          // apply a style to highlight the selected item as red when slider is active
          item.setAttribute("material", "color: red");
        } else {
          // apply a style to highlight the selected item as orange when slider is not active
          item.setAttribute("material", "color: orange");
        }
      } else {
        // reset the style or class for non-selected items
        item.setAttribute("material", "color", itemConfig.color);
      }
    });
  },

  onXButtonDown: function () {

    const selectedItemConfig = this.getSelectedItem();
    const id = selectedItemConfig.id;
    
    console.log("select confuguekl: ", selectedItemConfig.id)
    if (selectedItemConfig) {
      if (selectedItemConfig.slider) {
        // toggle the slider
        this.sliderActive = !this.sliderActive;
      } else if (!this.sliderActive) {
        // execute the callback function for the selected item
        selectedItemConfig.callback(id);
      }
    }
    this.highlightSelectedItem();
  },

  updateMenuConfig: function (rows, columns, menuSelector, pages) {
    this.data.rows = rows;
    this.data.columns = columns;
    this.data.menuSelector = menuSelector;
    this.selectedRow = 0;
    this.selectedColumn = 0;
    this.pages = pages;
    console.log("MENUCONFIG");
    console.log(pages);
  },
});
