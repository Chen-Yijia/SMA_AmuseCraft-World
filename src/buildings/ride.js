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
    this.waitingVisitors = [];

    /**
     * The visitors currently on the ride
     * @type {Vehicle[]}
     */
    this.loadedVisitors = [];

  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city
   */
  step(city) {
    super.step(city);

    // If the ride is idle
    if (this.state === "idle") {
      if (this.waitingVisitors.length > 0) {
        // If the ride is idle and have visitors in the waiting area
        const numberToLoad = Math.min(this.waitingVisitors.length, this.rideCapacity);

        // Move visitors from waiting area to loaded area
        const visitorsToLoad = this.waitingVisitors.slice(0,numberToLoad);
        this.loadedVisitors = visitorsToLoad;

        for (let i = 0; i < numberToLoad; i++) {
          this.waitingVisitors.shift();
        }

        // Update the lastRunTime & ride State
        this.lastRunTime = city.currentSimulationTime;
        this.state = 'in operation';
      }
    }

    // If the ride is in operation
    if (this.state === 'in operation') {
      
      if (city.currentSimulationTime >= this.lastRunTime + this.rideDuration) {
        // if the last run has done

        // 1. Record the revenue
        this.accumulatedRevenue += this.ticketPrice * this.loadedVisitors.length;

        // Release the visitors **TODO** (reset the visitor starting and destination)
        // 2. reset the visitor starting & destination
        this.#releaseVisitors(this.loadedVisitors);
        // 3. Update the state
        this.state = 'idle';
      }
    }
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    super.dispose();
  }


  /**
   * When the ride run is finished, release the currently loaded visitors.
   * @param {Vehicle[]} loadedVisitors 
   */
  #releaseVisitors(loadedVisitors) {
    // **TODO**: implement (reseting the visitor starting and destination)

    this.loadedVisitors = [];
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
    <span class="info-value">${this.waitingVisitors.length} pax</span>
    <br>
    <span class="info-label">Number of Loaded Visitors </span>
    <span class="info-value">${this.loadedVisitors.length} pax</span>
    <br>
    <span class="info-label">Ride Status </span>
    <span class="info-value">${this.state}</span>
    <br>
    <span class="info-label">Revenue </span>
    <span class="info-value">$ ${this.accumulatedRevenue}</span>
    <br>
    `;
    return html;
  }
}
