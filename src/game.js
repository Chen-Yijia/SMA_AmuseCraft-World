import { City } from "./city.js";
import { Building } from "./buildings/building.js";
import { Tile } from "./tile.js";
import { SceneManager } from "./sceneManager.js";

export class Game {
  selectedControl = document.getElementById("button-select"); // select tool
  activeToolId = "select";

  /**
   * The current focused object
   * @type {Building | Tile}
   */
  focusedObject = null;
  // Last time mouse was moved
  lastMove = new Date();

  simulationStarted = false;
  simulationTime = 0;

  ridesElements = [
    "circus-tent",
    "water-ride",
    "bumper-car",
    "ferris-wheel",
    "roundabout",
    "carousel",
    "swing-claw",
    "space-adventure",
    "rollercoaster",
    "arcade",
  ];

  standElements = [
    "hot-dog",
    "burger",
    "cafe",
    "chinese-restaurant",
    "ice-cream",
  ];

  constructor() {
    /**
     * The city data model
     * @type {City}
     */
    this.city = new City(16);

    this.graphPlotter = new GraphPlotter();

    // this.graphPlotter = new GraphPlotter();
    // this.graphPlotter.plotTest();
    // this.graphPlotter.plotRoadHeatmap("testHeatmap");

    /**
     * The 3D game scene
     */
    this.sceneManager = new SceneManager(this.city, () => {
      console.log("scene loaded");
      this.sceneManager.start();
      setInterval(this.step.bind(this), 1000);
    });

    // Hookup event listeners
    this.sceneManager.gameWindow.addEventListener(
      "wheel",
      this.sceneManager.cameraManager.onMouseScroll.bind(
        this.sceneManager.cameraManager
      ),
      false
    );
    this.sceneManager.gameWindow.addEventListener(
      "mousedown",
      this.#onMouseDown.bind(this),
      false
    );
    this.sceneManager.gameWindow.addEventListener(
      "mousemove",
      this.#onMouseMove.bind(this),
      false
    );

    // Prevent context menu from popping up
    this.sceneManager.gameWindow.addEventListener(
      "contextmenu",
      (event) => event.preventDefault(),
      false
    );
  }

  /**
   * Main update method for the game
   */
  step() {
    if (!this.simulationStarted) {
      return;
    }

    // Update the city data model first, then update the scene
    this.city.step(this.simulationTime);
    this.sceneManager.applyChanges(this.city);

    this.#updateTitleBar();
    this.#updateInfoPanel();

    if (this.simulationStarted) {
      this.simulationTime++;
    }

    // PLOTTING
    let allRideStats = this.city.getAllRideStatistics();

    // road tile heatmap
    this.graphPlotter.plotRoadHeatmap(
      "road-tile-heatmap",
      this.city.statistics.roadHeatmap
    );

    // visitor time in park histogram
    this.graphPlotter.plotVisitorTimeInPark(
      "visitor-time-histogram",
      this.city.statistics.visitorTimeInPark
    );

    // visitor money spent in park histogram
    this.graphPlotter.plotVisitorMoneySpentInPark(
      "visitor-money-histogram",
      this.city.statistics.visitorMoneySpent
    );

    // visitor distribution
    this.graphPlotter.plotVisitorDistribution(
      "visitor-distribution-pie-chart",
      allRideStats["queue-queue"],
      this.sceneManager.vehicleGraph.vehicles.children.length
    );

    // ride status in time series
    this.graphPlotter.plotRideStatusTimeSeries(
      "ride-status-line-chart",
      allRideStats["queue-status"]
    );

    // ride proportion of time being busy
    this.graphPlotter.plotRideProportionBusy(
      "ride-busy-bar-chart",
      "ride-busy-line-chart",
      allRideStats["queue-status"]
    );

    // ride queue stats
    this.graphPlotter.plotRideQueueStats(
      "ride-queue-bar-chart",
      allRideStats["queue-queue"]
    );

    // ride ridership
    this.graphPlotter.plotRideTotalRidership(
      "ride-ridership-bar-chart",
      allRideStats["revenue-ridership"]
    );

    // ride realtime profit & revenue
    this.graphPlotter.plotRideRevenueAndProfit(
      "ride-revenue-profit-bar-chart",
      allRideStats["revenue-revenue"],
      allRideStats["revenue-profit"]
    );

    // ride long-run revenue per time
    this.graphPlotter.plotRideRevenuePerTime(
      "ride-revenue-per-time-bar-chart",
      "ride-revenue-per-time-line-chart",
      allRideStats["revenue-revenue"]
    );
  }

  /**
   *
   * @param {*} event
   */
  onToolSelected(event) {
    // Deselect previously selected button and selected this one
    if (this.selectedControl) {
      this.selectedControl.classList.remove("selected");
    }
    this.selectedControl = event.target;
    this.selectedControl.classList.add("selected");

    this.activeToolId = this.selectedControl.getAttribute("data-type");
    console.log(this.activeToolId);

    // If the activeTool is "Ride", then show the ride tool kit list
    if (
      this.ridesElements.includes(this.activeToolId) ||
      this.activeToolId === "ride"
    ) {
      document.getElementById("ride-tool-kit-list").style.visibility =
        "visible";
    } else {
      document.getElementById("ride-tool-kit-list").style.visibility = "hidden";
    }

    // If the activeTool is "Stand", then show the stand tool kit list
    if (
      this.standElements.includes(this.activeToolId) ||
      this.activeToolId === "stand"
    ) {
      document.getElementById("stand-tool-kit-list").style.visibility =
        "visible";
    } else {
      document.getElementById("stand-tool-kit-list").style.visibility =
        "hidden";
    }

    if (this.activeToolId === "setting") {
      document.getElementById("setting-kit-list").style.visibility = "visible";
    } else {
      document.getElementById("setting-kit-list").style.visibility = "hidden";
    }

    if (this.activeToolId === "download") {
      const refinedData = [
        ["firstName", "lastName"],
        ["Idorenyin", "Udoh"],
        ["Loyle", "Carner"],
        ["Tamunotekena", "Dagogo"],
      ];
      let csvContent = "";
      refinedData.forEach((row) => {
        csvContent += row.join(",") + "\n";
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8," });
      const objUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", objUrl);
      link.setAttribute("download", "File.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // this.graphPlotter = new GraphPlotter();
      // this.graphPlotter.plotRoadHeatmap(
      //   "roat-tile-heatmap",
      //   this.city.statistics.roadHeatmap
      // );
    }
  }

  /**
   * Toggles the pause state of the game
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    console.log(`Is Paused: ${this.isPaused}`);
    if (this.isPaused) {
      document.getElementById("pause-button-icon").src =
        "public/icons/play.png";
    } else {
      document.getElementById("pause-button-icon").src =
        "public/icons/pause.png";
    }
  }

  /**
   * Start the simulation & start updating the currentTime
   */
  togglePlay() {
    this.simulationStarted = !this.simulationStarted;
    this.city.simulatedStarted = this.simulationStarted;
    console.log(`Simulation is started: ${this.simulationStarted}`);
    if (this.simulationStarted) {
      document.getElementById("play-button-icon").src =
        "public/icons/pause-color.png";
    } else {
      document.getElementById("play-button-icon").src =
        "public/icons/play-color.png";
    }
  }

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event
   */
  #onMouseDown(event) {
    // Check if left mouse button pressed
    if (event.button === 0) {
      const selectedObject = this.sceneManager.getSelectedObject(event);
      this.#useActiveTool(selectedObject);
    }

    this.sceneManager.cameraManager.onMouseMove(event);
  }

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event
   */
  #onMouseMove(event) {
    // Throttle event handler so it doesn't kill the browser
    if (Date.now() - this.lastMove < 1 / 60.0) return;
    this.lastMove = Date.now();

    // Get the object the mouse is currently hovering over
    const hoverObject = this.sceneManager.getSelectedObject(event);

    this.sceneManager.setHighlightedMesh(hoverObject);

    // If left mouse-button is down, use the tool as well
    if (hoverObject && event.buttons & 1) {
      this.#useActiveTool(hoverObject);
    }

    this.sceneManager.cameraManager.onMouseMove(event);
  }

  #useActiveTool(object) {
    // If no object is selected, clear the info panel
    if (!object) {
      this.#updateInfoPanel(null);
      return;
    } else {
      const tile = object.userData;
      if (this.activeToolId === "select") {
        this.sceneManager.setActiveObject(object);
        this.focusedObject = tile;
        this.#updateInfoPanel();
      } else if (this.activeToolId === "bulldoze") {
        this.city.bulldoze(tile.x, tile.y);
        this.sceneManager.applyChanges(this.city);
      } else if (!tile.building) {
        console.log("current active tool", this.activeToolId);
        const buildingType = this.activeToolId;

        // if selected is "Ride" type
        if (this.ridesElements.includes(this.activeToolId)) {
          this.city.placeBuilding(tile.x, tile.y, "ride", buildingType); // WIP (need to change to specific ride)
          this.sceneManager.applyChanges(this.city);
        } else if (this.standElements.includes(this.activeToolId)) {
          this.city.placeBuilding(tile.x, tile.y, "stand", buildingType); // WIP (need to change to specific stand)
          this.sceneManager.applyChanges(this.city);
        } else {
          this.city.placeBuilding(tile.x, tile.y, buildingType, "");
          this.sceneManager.applyChanges(this.city);
        }
      }
    }
  }

  #updateInfoPanel() {
    if (this.focusedObject?.toHTML) {
      document.getElementById("info-details").innerHTML =
        this.focusedObject.toHTML();
    } else {
      document.getElementById("info-details").innerHTML = "";
    }
  }

  #updateTitleBar() {
    document.getElementById("cost-total").innerHTML =
      "-$ " + this.city.getTotalCost().toFixed(1);

    document.getElementById("revenue-total").innerHTML =
      "$ " + this.city.getTotalRevenue().toFixed(1);

    document.getElementById("simulation-time-elapsed").innerHTML =
      this.simulationTime;

    document.getElementById("visitor-created-total").innerHTML =
      this.sceneManager.vehicleGraph.totalVisitorCreated;

    document.getElementById("visitor-angry-exit-total").innerHTML =
      this.sceneManager.vehicleGraph.totalAngryVisitors;

    document.getElementById("fixed-cost-total").innerHTML =
      "-$ " + this.city.getFixedCost().toFixed(1);

    document.getElementById("variable-cost-total").innerHTML =
      "-$ " + this.city.getOperationalCost().toFixed(1);
  }
}
