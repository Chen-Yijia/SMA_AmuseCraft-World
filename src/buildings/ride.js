import { Vehicle } from "../vehicles/vehicle.js";
import { City } from "../city.js";
import config from "../config.js";
import { Zone } from "./zone.js";

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

    this.accumulatedRevenue = 0;
    this.thrillLevel = config.ride.thrillLevel[this.subType];
    this.installationCost = config.ride.costInstallation[this.subType];
    this.ticketPrice = config.ride.ticketPrice[this.subType];
    this.rideDuration = config.ride.rideDuration[this.subType];
    this.rideCapacity = config.ride.rideCapacity[this.subType];

    this.lastRunTime = 0;
    
    /**
     * The current state of the Ride
     * @type {'idle' | 'in operation'}
     */
    this.state = 'idle';
    

    /**
     * The visitors in the waiting area
     * @type {Vehicle[]}
     */
    this.waitingArea = [];
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
   * Get the number of visitors currently in the waiting area
   * @returns {number}
   */
  getNumerOfWaitingVisitors() {
    return this.waitingArea.length;
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
    <span class="info-label">Ride Duration </span>
    <span class="info-value">${this.rideDuration} mins</span>
    <br>
    <span class="info-label">Ride Capacity </span>
    <span class="info-value">${this.rideCapacity} pax</span>
    <br>
    <span class="info-label">Number of Waiting Visitors </span>
    <span class="info-value">${this.waitingArea.length} pax</span>
    <br>
    <span class="info-label">Ride Status </span>
    <span class="info-value">${this.state}</span>
    <br>
    `;
    return html;
  }
}
