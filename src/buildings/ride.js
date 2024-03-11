import { Citizen } from "../citizens.js";
import { City } from "../city.js";
import config from "../config.js";
import { Zone } from "./zone.js";

const thrillLevelMapping = {
  "circus-tent": "family",
  "water-ride": "thrill",
  "bumper-car": "thrill",
  "ferris-wheel": "family",
  "roundabout": "family",
  "carousel": "family",
  "swing-claw": "thrill",
  "space-adventure": "thrill",
  "rollercoaster": "thrill",
  "arcade": "family",
};

export class Ride extends Zone {
  constructor(x, y, subType) {
    super(x, y);
    this.name = "ride";
    this.type = "ride";

    this.subType = subType;

    if (this.subType === '') {
      const rideSubTypes = Object.keys(thrillLevelMapping);
      const i = Math.floor(rideSubTypes.length * Math.random());
      this.subType = rideSubTypes[i];
    }

    this.thrillLevel = thrillLevelMapping[this.subType];
    this.installationCost = config.ride.costInstallation[this.subType];
    this.ticketPrice = config.ride.ticketPrice[this.subType];
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
    <span class="info-label">Thrill Level </span>
    <span class="info-value">${this.thrillLevel}</span>
    <br>
    <span class="info-label">Installation Cost </span>
    <span class="info-value">$ ${this.installationCost}</span>
    <br>
    <span class="info-label">Ticket Price per Visitor </span>
    <span class="info-value">$ ${this.ticketPrice}</span>
    <br>
    `;
    return html;
  }
}
