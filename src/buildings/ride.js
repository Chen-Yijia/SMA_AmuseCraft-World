import { Vehicle } from "../vehicles/vehicle.js";
import { City } from "../city.js";
import { defaultConfig, updateConfig } from "../config.js";
import { Zone } from "./zone.js";

var config = { ...defaultConfig };

export class Ride extends Zone {
  constructor(x, y, subType) {
    super(x, y);
    config = { ...updateConfig() };
    this.name = "ride";
    this.type = "ride";

    this.subType = subType;

    if (this.subType === "") {
      const rideSubTypes = Object.keys(config.ride.thrillLevel);
      const i = Math.floor(rideSubTypes.length * Math.random());
      this.subType = rideSubTypes[i];
    }

    this.totalRidership = 0;
    this.accumulatedRevenue = 0;
    this.accumulatedCost = 0;
    this.thrillLevel = config.ride.thrillLevel[this.subType];
    this.installationCost = config.ride.costInstallation[this.subType];
    this.operationalCost = config.ride.operationalCost[this.subType];
    this.ticketPrice = config.ride.ticketPrice[this.subType];
    this.rideDuration = config.ride.rideDuration[this.subType];
    this.rideCapacity = config.ride.rideCapacity[this.subType];

    this.lastRunTime = 0;

    /**
     * The expected waiting time if a visitor joins the queue now.
     * @type {number}
     */
    this.waitTime = 0;

    /**
     * The current state of the Ride
     * @type {'idle' | 'in operation'}
     */
    this.state = "idle";

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

    /**
     * Statistics for each ride, used for plotting the statistics for the whole scene
     * @type {{
     * queueStats: {
     * status: {
     * timeStamps: number[],
     * rideStatus: number[]
     * },
     * queue: {
     * timeStamps: number[],
     * waitingLength: number[],
     * loadedLength: number[],
     * totalLength: number[]
     * }
     * },
     * revenueStas: {
     * ridership: {
     * timeStamps: number[],
     * totalRidership: number[],
     * currentTotalRidership: number,
     * },
     * revenue: {
     * timeStamps: number[],
     * totalRevenue: number[],
     * revenuePerTime: number[],
     * currentTotalRevenue: number,
     * currentRevenuePerTime: number,
     * },
     * profit: {
     * timeStamps: number[],
     * totalProfit: number[],
     * profitPerTime: number[],
     * currentTotalProfit: number,
     * currentProfitPerTime: number,
     * }
     * },
     *
     * }}
     */
    this.rideStatistics = {
      queueStats: {
        status: {
          timeStamps: [],
          rideStatus: [],
        },
        queue: {
          timeStamps: [],
          waitingLength: [],
          loadedLength: [],
          totalLength: [],
        },
      },
      revenueStas: {
        ridership: {
          timeStamps: [],
          totalRidership: [],
          currentTotalRidership: 0,
        },
        revenue: {
          timeStamps: [],
          totalRevenue: [],
          revenuePerTime: [],
          currentTotalRevenue: 0,
          currentRevenuePerTime: 0,
        },
        profit: {
          timeStamps: [],
          totalProfit: [],
          profitPerTime: [],
          currentTotalProfit: 0,
          currentProfitPerTime: 0, // revenue per time - operation cost
        },
      },
    };
  }

  /**
   * Get the waiting time of the ride for a visitor to join the waiting queue.
   * @param {City} city
   */
  updateWaitingTime(city) {
    var waitingTime = 0;
    // waiting time results from remaining operation time (if "in_operation")
    if (this.state === "in operation") {
      let remainingTime =
        this.rideDuration - (city.currentSimulationTime - this.lastRunTime);
      waitingTime += remainingTime;
    }

    // waiting time results from the people in front of you waiting
    let numRunsBefore = Math.floor(
      this.waitingVisitors.length / this.rideCapacity
    );
    waitingTime += numRunsBefore * this.rideDuration;
    this.waitTime = waitingTime;
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

    // If the ride is idle
    if (this.state === "idle") {
      if (this.waitingVisitors.length > 0) {
        // If the ride is idle and have visitors in the waiting area
        const numberToLoad = Math.min(
          this.waitingVisitors.length,
          this.rideCapacity
        );

        // Move visitors from waiting area to loaded area
        const visitorsToLoad = this.waitingVisitors.slice(0, numberToLoad);
        this.loadedVisitors = visitorsToLoad;

        for (let i = 0; i < numberToLoad; i++) {
          this.waitingVisitors.shift();
        }

        // Update the lastRunTime & ride State
        this.lastRunTime = city.currentSimulationTime;
        this.state = "in operation";

        // Update mesh status
        // TODO: in asset manager, set the material color to indicate it's busy
        this.isMeshOutOfDate = true;
      }
    }

    // If the ride is in operation
    if (this.state === "in operation") {
      if (city.currentSimulationTime >= this.lastRunTime + this.rideDuration) {
        // if the last run has done

        // 1. Record the revenue & ridership
        this.accumulatedRevenue +=
          this.ticketPrice * this.loadedVisitors.length;
        this.totalRidership += this.loadedVisitors.length;

        // 2. reset the visitor starting & destination
        this.#disEmbarkVisitors();

        // 3. Update the state
        this.state = "idle";

        //Update mesh status
        this.isMeshOutOfDate = true;
      }
    }

    // update statistics
    this.updateStatistics(city);
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    // set the new destination for visitors in both waiting & loaded
    this.#evictVisitors();
    super.dispose();
  }

  /**
   * When the ride run is finished, release the currently loaded visitors.
   */
  #disEmbarkVisitors() {
    // set a new destination for visitor when released.
    this.loadedVisitors.forEach((visitor) => {
      // update the visited rides
      visitor.visitedRides.push(this);

      // record the money spent
      visitor.moneySpent += this.ticketPrice;

      // try finding the next ride destination for the visitor
      const nextRideTarget = visitor.findNextRidePath(
        visitor.origin,
        visitor.rideTiles
      );

      if (nextRideTarget == null) {
        // set the destination to entrance (exit) if no such rides & change the isLeaving state
        visitor.isLeaving = true;
        // find the path to exit
        const exitTarget = visitor.findExitPath(
          visitor.origin,
          visitor.exitTiles
        );
        if (exitTarget == null) {
          console.log(
            "could not find path to exit, exit tile: ",
            visitor.entranceTile
          );
          visitor.destination = null; // it will get disposed during the next update cycle
        } else {
          visitor.finalDestinationRideNode = exitTarget.destinationNode;
          visitor.finalDestinationRidceTile = exitTarget.exitTile;
          visitor.pathToDestinationRideNode = exitTarget.pathToDestination;
          visitor.destination = visitor.pathToDestinationRideNode[1];
        }
      } else {
        // set the new destination
        console.log(
          "next ride target",
          nextRideTarget.nextRideTile.building.subType
        );
        visitor.finalDestinationRideNode = nextRideTarget.destinationNode;
        visitor.finalDestinationRideTile = nextRideTarget.nextRideTile;
        visitor.pathToDestinationRideNode = nextRideTarget.pathToDestination;
        visitor.destination = visitor.pathToDestinationRideNode[1];
      }

      // update the position and cycle time & reset isPaused
      visitor.updateWorldPositions();
      visitor.cycleStartTime = Date.now();
      visitor.isPaused = false;

      // revert the mesh style (opacity = 1, visibility = true )
      visitor.children[0].visible = true;
    });

    // set the loadedVisitors to empty.
    this.loadedVisitors = [];
  }

  /**
   * When the ride run is removed, evict all visitors in both waiting & loaded
   */
  #evictVisitors() {
    const allVisitors = this.loadedVisitors.concat(this.waitingVisitors);
    // set a new destination for visitor when released.
    allVisitors.forEach((visitor) => {
      // update the visited rides
      visitor.visitedRides.push(this);

      // record the money spent
      visitor.moneySpent += this.ticketPrice;

      // try finding the next ride destination for the visitor
      const nextRideTarget = visitor.findNextRidePath(
        visitor.origin,
        visitor.rideTiles
      );

      if (nextRideTarget == null) {
        // set the destination to entrance (exit) if no such rides & change the isLeaving state
        visitor.isLeaving = true;
        // find the path to exit
        const exitTarget = visitor.findExitPath(
          visitor.origin,
          visitor.exitTiles
        );
        if (exitTarget == null) {
          console.log(
            "could not find path to exit, exit tile: ",
            visitor.entranceTile
          );
          visitor.destination = null; // it will get disposed during the next update cycle
        } else {
          visitor.finalDestinationRideNode = exitTarget.destinationNode;
          visitor.finalDestinationRidceTile = exitTarget.exitTile;
          visitor.pathToDestinationRideNode = exitTarget.pathToDestination;
          visitor.destination = visitor.pathToDestinationRideNode[1];
        }
      } else {
        // set the new destination
        console.log(
          "next ride target",
          nextRideTarget.nextRideTile.building.subType
        );
        visitor.finalDestinationRideNode = nextRideTarget.destinationNode;
        visitor.finalDestinationRideTile = nextRideTarget.nextRideTile;
        visitor.pathToDestinationRideNode = nextRideTarget.pathToDestination;
        visitor.destination = visitor.pathToDestinationRideNode[1];
      }

      // update the position and cycle time & reset isPaused
      visitor.updateWorldPositions();
      visitor.cycleStartTime = Date.now();
      visitor.isPaused = false;

      // revert the mesh style (opacity = 1, visibility = true )
      visitor.children[0].visible = true;
    });

    this.waitingVisitors = [];
    this.loadedVisitors = [];
  }

  /**
   * Update the statistics for the ride
   * @param {City} city
   */
  updateStatistics(city) {
    this.updateQueueStats(city);
    this.updateRevenueStats(city);
  }

  /**
   * Update the queue stats for ride
   * @param {City} city
   */
  updateQueueStats(city) {
    // update status stats
    this.rideStatistics.queueStats.status.timeStamps.push(
      city.currentSimulationTime
    );
    this.rideStatistics.queueStats.status.rideStatus.push(
      this.state == "idle" ? 0 : 1
    );

    // update queue stats
    this.rideStatistics.queueStats.queue.timeStamps.push(
      city.currentSimulationTime
    );
    this.rideStatistics.queueStats.queue.waitingLength.push(
      this.waitingVisitors.length
    );
    this.rideStatistics.queueStats.queue.loadedLength.push(
      this.loadedVisitors.length
    );
    this.rideStatistics.queueStats.queue.totalLength.push(
      this.waitingVisitors.length + this.loadedVisitors.length
    );
  }

  /**
   * Update the revenue stats for ride
   * @param {City} city
   */
  updateRevenueStats(city) {
    // update ridership stats
    this.rideStatistics.revenueStas.ridership.timeStamps.push(
      city.currentSimulationTime
    );
    this.rideStatistics.revenueStas.ridership.totalRidership.push(
      this.totalRidership
    );
    this.rideStatistics.revenueStas.ridership.currentTotalRidership =
      this.totalRidership;

    // update revenue stats
    this.rideStatistics.revenueStas.revenue.timeStamps.push(
      city.currentSimulationTime
    );
    this.rideStatistics.revenueStas.revenue.totalRevenue.push(
      this.accumulatedRevenue
    );
    this.rideStatistics.revenueStas.revenue.revenuePerTime.push(
      this.accumulatedRevenue / city.currentSimulationTime
    );
    this.rideStatistics.revenueStas.revenue.currentTotalRevenue =
      this.accumulatedRevenue;
    this.rideStatistics.revenueStas.revenue.currentRevenuePerTime =
      this.accumulatedRevenue / city.currentSimulationTime;

    // update profit stats
    this.rideStatistics.revenueStas.profit.timeStamps.push(
      city.currentSimulationTime
    );
    this.rideStatistics.revenueStas.profit.totalProfit.push(
      this.accumulatedRevenue - this.accumulatedCost
    );
    this.rideStatistics.revenueStas.profit.profitPerTime.push(
      this.accumulatedRevenue / city.currentSimulationTime -
        this.operationalCost
    );
    this.rideStatistics.revenueStas.profit.currentTotalProfit =
      this.accumulatedRevenue - this.accumulatedCost;
    this.rideStatistics.revenueStas.profit.currentProfitPerTime =
      this.accumulatedRevenue / city.currentSimulationTime -
      this.operationalCost;
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
    <span class="info-label">Installation/ Operational Cost </span>
    <span class="info-value">$ ${this.installationCost} / $ ${
      this.operationalCost
    } </span>
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
    <span class="info-label">Ride Status </span>
    <span class="info-value">${this.state}</span>
    <br>
    <span class="info-label">Expected Waiting Time </span>
    <span class="info-value">${this.waitTime} mins</span>
    <br>
    <span class="info-label">Revenue </span>
    <span class="info-value">$ ${this.accumulatedRevenue.toFixed(1)}</span>
    <br>
    <span class="info-label">Expense </span>
    <span class="info-value">$ ${this.accumulatedCost.toFixed(1)}</span>
    <br>
    <span class="info-label">Total Ridership </span>
    <span class="info-value">${this.totalRidership} pax</span>
    <br>
    `;

    if (this.waitingVisitors.length > 0) {
      html += `
      <div class="info-heading">Visitors Waiting ( ${this.waitingVisitors.length} pax )</div>`;
      html += '<ul class="info-citizen-list">';
      for (const waitingVisitor of this.waitingVisitors) {
        html += waitingVisitor.toHTML();
      }
      html += "</ul>";
    }

    if (this.loadedVisitors.length > 0) {
      html += `
      <div class="info-heading">Visitors Loaded ( ${this.loadedVisitors.length} pax )</div>`;
      html += '<ul class="info-citizen-list">';
      for (const loadedVisitor of this.loadedVisitors) {
        html += loadedVisitor.toHTML();
      }
      html += "</ul>";
    }

    return html;
  }
}
