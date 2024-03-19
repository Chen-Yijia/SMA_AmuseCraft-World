import { City } from "../city.js";
import { defaultConfig, updateConfig } from "../config.js";
import { Vehicle } from "../vehicles/vehicle.js";
import { Zone } from "./zone.js";
import { gaussianRandom } from "../utils.js";

var config = { ...defaultConfig };

const standElements = [
  "hot-dog",
  "burger",
  "cafe",
  "chinese-restaurant",
  "ice-cream",
];

export class Stand extends Zone {
  constructor(x, y, subType) {
    super(x, y);
    config = { ...updateConfig() };
    this.name = "stand";
    this.type = "stand";
    this.subType = subType;

    if (this.subType === "") {
      const standSubTypes = Object.entries(standElements).map((x) => x[1]);
      const i = Math.floor(standSubTypes.length * Math.random());
      this.subType = standSubTypes[i];
    }

    this.installationCost = config.stand.costInstallation[this.subType];
    this.operationalCost = config.stand.operationalCost[this.subType];
    this.revenuePerCustomerMean = config.stand.arpcMean[this.subType];
    this.revenuePerCustomerSd = config.stand.arpcSd[this.subType];
    this.purchaseOpportunity = config.stand.purchaseOpportunity[this.subType];
    this.timeToSpendMean = config.stand.timeToSpendMean[this.subType];
    this.timetoSpendSd = config.stand.timeToSpendSd[this.subType];

    /**
     * The visitors to be admitted
     * @type {{visitor: Vehicle, enterTime: number, stayDuration: number, mealCost: number}[]}
     */
    this.waitingVisitors = [];

    /**
     * The visitors currently in the stand
     * @type {{visitor: Vehicle, enterTime: number, stayDuration: number, mealCost: number}[]}
     */
    this.loadedVisitors = [];

    this.accumulatedRevenue = 0;
    this.accumulatedCost = 0;
    this.customerTraffic = 0;
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city
   */
  step(city) {
    super.step(city);

    // update cost
    this.accumulatedCost =
      this.installationCost + city.currentSimulationTime * this.operationalCost;

    // load the waiting visitors
    this.waitingVisitors.forEach((waiting_visitor) => {
      waiting_visitor.enterTime = city.currentSimulationTime;
      this.loadedVisitors.push(waiting_visitor);
    });
    this.waitingVisitors = [];

    // loop over the loadedVisitors and release them if they have "finished meal"
    var i = this.loadedVisitors.length;
    while (i--) {
      let currentVisitor = this.loadedVisitors[i];
      if (
        city.currentSimulationTime >=
        currentVisitor.enterTime + currentVisitor.stayDuration
      ) {
        // record the money spent
        this.accumulatedRevenue += currentVisitor.mealCost;
        this.customerTraffic += 1;
        // release current visitor
        this.#releaseVisitor(currentVisitor);
        this.loadedVisitors.splice(i, 1);
      }
    }
  }

  /**
   * Add visitor to loadedVisitors
   * @param {Vehicle} visitor
   */
  loadVisitor(visitor) {
    const randomStayDuration = gaussianRandom(
      this.timeToSpendMean,
      this.timetoSpendSd
    );
    const mealCost = gaussianRandom(
      this.revenuePerCustomerMean,
      this.revenuePerCustomerSd
    );
    this.waitingVisitors.push({
      visitor: visitor,
      enterTime: 0,
      stayDuration: randomStayDuration,
      mealCost: mealCost,
    });
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.#releaseAllVisitors();
    super.dispose();
  }

  #releaseAllVisitors() {
    this.loadedVisitors.forEach((loaded_visitor) => {
      this.#releaseVisitor(loaded_visitor);
    });
    this.waitingVisitors.forEach((waiting_visitor) => {
      this.#releaseVisitor(waiting_visitor);
    });
    this.loadedVisitors = [];
    this.waitingVisitors = [];
  }

  /**
   * Release the visitor who has finished the meal
   * @param {{visitor: Vehicle, stayDuration: number, mealCost: number}} loadedVisitor
   */
  #releaseVisitor(loadedVisitor) {
    // update the visited stands
    loadedVisitor.visitor.visitedStand.push(this);

    // realise the money spent
    loadedVisitor.visitor.moneySpent += loadedVisitor.mealCost;

    // update the position and cycle time & reset isPaused
    loadedVisitor.visitor.updateWorldPositions();
    loadedVisitor.visitor.cycleStartTime = Date.now();
    loadedVisitor.visitor.isPaused = false;

    // revert the mesh style (opacity = 1, visibility = true )
    loadedVisitor.visitor.children[0].visible = true;
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `
    <span class="info-label">Installation/ Operational Cost </span>
    <span class="info-value">$ ${this.installationCost} / $ ${
      this.operationalCost
    }</span>
    <br>
    <span class="info-label">Average / SD of Revenue per Visitor </span>
    <span class="info-value">$ ${this.revenuePerCustomerMean}  /  $ ${
      this.revenuePerCustomerSd
    }</span>
    <br>
    <span class="info-label">Average / SD of Time to Spend </span>
    <span class="info-value">${this.timeToSpendMean}  /  ${
      this.timetoSpendSd
    } mins</span>
    <br>
    <span class="info-label">Stop By opportunity </span>
    <span class="info-value">${this.purchaseOpportunity * 100} %</span>
    <br>
    <span class="info-label">Revenue </span>
    <span class="info-value">$ ${this.accumulatedRevenue.toFixed(1)}</span>
    <br>
    <span class="info-label">Expense </span>
    <span class="info-value">$ ${this.accumulatedCost.toFixed(1)}</span>
    <br>
    <span class="info-label">Total Customer Traffic </span>
    <span class="info-value">${this.customerTraffic} pax</span>
    <br>
    `;
    if (this.loadedVisitors.length > 0) {
      html += `
      <div class="info-heading">Visitors Loaded ( ${this.loadedVisitors.length} pax )</div>`;
      html += '<ul class="info-citizen-list">';
      for (const loadedVisitor of this.loadedVisitors) {
        html += loadedVisitor.visitor.toHTML();
      }
      html += "</ul>";
    }

    if (this.waitingVisitors.length > 0) {
      html += `
      <div class="info-heading">Visitors Waiting ( ${this.waitingVisitors.length} pax )</div>`;
      html += '<ul class="info-citizen-list">';
      for (const waitingVisitor of this.waitingVisitors) {
        html += waitingVisitor.visitor.toHTML();
      }
      html += "</ul>";
    }

    return html;
  }
}
