import { Citizen } from '../citizens.js';
import { City } from '../city.js';
import config from '../config.js';
import { Zone } from './zone.js';


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
    this.name = "stand";
    this.type = 'stand';
    this.subType = subType;

    if (this.subType === '') {
      const standSubTypes = Object.entries(standElements).map((x) => x[1]);
      const i = Math.floor(standSubTypes.length * Math.random());
      this.subType = standSubTypes[i];
    }

    this.installationCost = config.stand.costInstallation[this.subType];
    this.revenuePerCustomer = config.stand.arpc[this.subType];
    this.accumulatedProfit = 0;
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   */
  step(city) {
    super.step(city);
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    super.dispose();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `
    <span class="info-label">Installation Cost </span>
    <span class="info-value">$ ${this.installationCost}</span>
    <br>
    <span class="info-label">Average Revenue per Visitor </span>
    <span class="info-value">$ ${this.revenuePerCustomer}</span>
    <br>
    `
    return html;
  }
}