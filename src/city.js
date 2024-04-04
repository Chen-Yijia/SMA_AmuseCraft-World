import { createBuilding } from "./buildings/buildingFactory.js";
import { Tile } from "./tile.js";

export class City {
  constructor(size) {
    this.size = size;

    /**
     * 2D array of tiles that make up the city
     * @type {Tile[][]}
     */
    this.tiles = [];

    this.currentSimulationTime = 0;

    this.simulatedStarted = false;

    // create the city in dimenson size*size
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        const tile = new Tile(x, y);
        column.push(tile);
      }
      this.tiles.push(column);
    }

    /**
     * @type {{
     * roadHeatmap: {x: number[], y: number[]},
     * visitorTimeInPark: {
     * kid: {enterTime: number[], leaveTime: number[], stayDuration: number[]},
     * elder: {enterTime: number[], leaveTime: number[], stayDuration: number[]},
     * adult: {enterTime: number[], leaveTime: number[], stayDuration: number[]},
     * },
     * visitorMoneySpent: {
     * kid: number[],
     * elder: number[],
     * adult: number[]
     * }
     * }}
     */
    this.statistics = {
      roadHeatmap: { x: [], y: [] },
      visitorTimeInPark: {
        kid: { enterTime: [], leaveTime: [], stayDuration: [] },
        elder: { enterTime: [], leaveTime: [], stayDuration: [] },
        adult: { enterTime: [], leaveTime: [], stayDuration: [] },
      },
      visitorMoneySpent: {
        kid: [],
        elder: [],
        adult: [],
      },
    };
  }

  /** Returns the tile at the coordinates. If the coordinates
   * are out of bounds, then `null` is returned.
   * @param {number} x The x-coordinate of the tile
   * @param {number} y The y-coordinate of the tile
   * @returns {Tile | null}
   */
  getTile(x, y) {
    if (
      x === undefined ||
      y === undefined ||
      x < 0 ||
      y < 0 ||
      x >= this.size ||
      y >= this.size
    ) {
      return null;
    } else {
      return this.tiles[x][y];
    }
  }

  getPopulation() {
    let population = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        population += tile.building?.residents?.length ?? 0;
      }
    }
    return population;
  }

  getTotalCost() {
    let cost = 0;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building) {
          if (tile.building.type === "road") {
            cost += tile.building.cost;
          } else if (
            tile.building.type === "ride" ||
            tile.building.type === "stand"
          ) {
            cost += tile.building.accumulatedCost;
          }
        }
      }
    }
    return cost;
  }

  getFixedCost() {
    let cost = 0;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building) {
          if (tile.building.type === "road") {
            cost += tile.building.cost;
          } else if (
            tile.building.type === "ride" ||
            tile.building.type === "stand"
          ) {
            cost += tile.building.installationCost;
          }
        }
      }
    }
    return cost;
  }

  getOperationalCost() {
    let cost = 0;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building) {
          if (tile.building.type === "ride" || tile.building.type === "stand") {
            cost +=
              tile.building.accumulatedCost - tile.building.installationCost;
          }
        }
      }
    }
    return cost;
  }

  getTotalRevenue() {
    let revenue = 0;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building) {
          if (tile.building.type === "ride" || tile.building.type === "stand") {
            revenue += tile.building.accumulatedRevenue;
          }
        }
      }
    }
    return revenue;
  }

  getBreakEvenTime() {
    var fixedCost = this.getFixedCost();
    var operatiionalProfitPerTime =
      (this.getTotalRevenue() - this.getOperationalCost()) /
      this.currentSimulationTime;
    var breakEvenTime = fixedCost / operatiionalProfitPerTime;
    if (breakEvenTime > 0) {
      return breakEvenTime.toFixed(2) + "\n Simulation Time Unit";
    } else {
      return "Negative Operational Profit";
    }
  }

  getAllRideStatistics() {
    let allRideStats = {
      "queue-status": [],
      "queue-queue": [],
      "revenue-ridership": [],
      "revenue-revenue": [],
      "revenue-profit": [],
    };

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building) {
          if (tile.building.type === "ride") {
            // update the stats
            allRideStats["queue-status"].push({
              ride_name: tile.building.subType,
              ride_status: tile.building.rideStatistics.queueStats.status,
            });

            allRideStats["queue-queue"].push({
              ride_name: tile.building.subType,
              ride_queue: tile.building.rideStatistics.queueStats.queue,
            });

            allRideStats["revenue-ridership"].push({
              ride_name: tile.building.subType,
              ride_ridership:
                tile.building.rideStatistics.revenueStas.ridership,
            });

            allRideStats["revenue-revenue"].push({
              ride_name: tile.building.subType,
              ride_revenue: tile.building.rideStatistics.revenueStas.revenue,
            });

            allRideStats["revenue-profit"].push({
              ride_name: tile.building.subType,
              ride_profit: tile.building.rideStatistics.revenueStas.profit,
            });
          }
        }
      }
    }

    return allRideStats;
  }

  getAllStandStatistics() {
    let allStandStats = {
      traffic: [],
      revenue: [],
      profit: [],
    };

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building) {
          if (tile.building.type === "stand") {
            // update the stats
            allStandStats.traffic.push({
              stand_name: tile.building.subType,
              stand_traffic: tile.building.standStatistics.trafficStats,
            });

            allStandStats.revenue.push({
              stand_name: tile.building.subType,
              stand_revenue: tile.building.standStatistics.revenue,
            });

            allStandStats.profit.push({
              stand_name: tile.building.subType,
              stand_profit: tile.building.standStatistics.profit,
            });
          }
        }
      }
    }

    return allStandStats;
  }

  /**
   * Places a building at the specified coordinates if the
   * tile does not already have a building on it
   * @param {number} x
   * @param {number} y
   * @param {string} buildingType
   * @param {string} specificBuildingType
   */
  placeBuilding(x, y, buildingType, specificBuildingType) {
    const tile = this.getTile(x, y);

    // If the tile doesnt' already have a building, place one there
    if (tile && !tile.building) {
      tile.building = createBuilding(x, y, buildingType, specificBuildingType);
      tile.building.refresh(this);

      // Refresh the adjacent buildings as well
      this.getTile(x - 1, y)?.building?.refresh(this);
      this.getTile(x + 1, y)?.building?.refresh(this);
      this.getTile(x, y - 1)?.building?.refresh(this);
      this.getTile(x, y + 1)?.building?.refresh(this);
    }
  }

  /**
   * Bulldozes the building at the specified coordinates
   * @param {number} x
   * @param {number} y
   */
  bulldoze(x, y) {
    const tile = this.getTile(x, y);

    if (tile.building) {
      tile.building.dispose();
      tile.building = null;

      // Refresh the adjacent buildings as well
      this.getTile(x - 1, y)?.building?.refresh(this);
      this.getTile(x + 1, y)?.building?.refresh(this);
      this.getTile(x, y - 1)?.building?.refresh(this);
      this.getTile(x, y + 1)?.building?.refresh(this);
    }
  }

  /**
   * Update the state of each tile in the city
   * @param {number} currentSimulationTime
   */
  step(currentSimulationTime) {
    // Update the current time
    this.currentSimulationTime = currentSimulationTime;

    // Update each building
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        tile.building?.step(this);
      }
    }
  }

  /**
   * Finds the first tile where the criteria are true
   * @param {{x: number, y: number}} start The starting coordinates of the search
   * @param {(Tile) => (boolean)} filter This function is called on each
   * tile in the search field until `filter` returns true, or there are
   * no more tiles left to search.
   * @param {number} maxDistance The maximum distance to search from the starting tile
   * @returns {Tile} The first tile matching `criteria`, otherwiser `null`
   */
  findTile(start, filter, maxDistance) {
    const startTile = this.getTile(start.x, start.y);
    const visited = new Set();
    const tilesToSearch = [];

    // Initialze our search with the starting tile
    tilesToSearch.push(startTile);

    while (tilesToSearch.length > 0) {
      const tile = tilesToSearch.shift();

      // Has this tile been visited? If so, ignore it and move on
      if (visited.has(tile.id)) {
        continue;
      } else {
        visited.add(tile.id);
      }

      // Check if tile is outside the search bounds
      const distance = startTile.distanceTo(tile);
      if (distance > maxDistance) continue;

      // Add this tiles neighbor's to the search list
      tilesToSearch.push(...this.getTileNeighbors(tile.x, tile.y));

      // If this tile passes the criteria
      if (filter(tile)) {
        return tile;
      }
    }

    return null;
  }

  /**
   * Finds the list of tiles where the criteria are true
   * @param {{x: number, y: number}} start The starting coordinates of the search
   * @param {(Tile) => (boolean)} filter This function is called on each
   * tile in the search field until `filter` returns true, or there are
   * no more tiles left to search.
   * @param {number} maxDistance The maximum distance to search from the starting tile
   * @returns {Tile[]} The first tile matching `criteria`, otherwiser `null`
   */
  findTileList(start, filter, maxDistance) {
    const startTile = this.getTile(start.x, start.y);
    const visited = new Set();
    const tilesToSearch = [];

    const targetTiles = [];

    // Initialze our search with the starting tile
    tilesToSearch.push(startTile);

    while (tilesToSearch.length > 0) {
      const tile = tilesToSearch.shift();

      // Has this tile been visited? If so, ignore it and move on
      if (visited.has(tile.id)) {
        continue;
      } else {
        visited.add(tile.id);
      }

      // Check if tile is outside the search bounds
      const distance = startTile.distanceTo(tile);
      if (distance > maxDistance) continue;

      // Add this tiles neighbor's to the search list
      tilesToSearch.push(...this.getTileNeighbors(tile.x, tile.y));

      // If this tile passes the criteria
      if (filter(tile)) {
        targetTiles.push(tile);
      }
    }

    return targetTiles;
  }

  /**
   * Find the entrance tile
   * @param {{x: number, y: number}} start
   * @param {number} maxDistance
   * @returns {Tile}
   */
  findEntranceTile(start, maxDistance) {
    const filter = (tile) => {
      if (tile.building) {
        return tile.building?.type === "entrance";
      }
      return false;
    };
    const entranceTile = this.findTile(start, filter, maxDistance);
    return entranceTile;
  }

  /**
   * Find the list of tiles that are next to entrance and are end tiles
   * @param {Tile} entranceTile
   */
  findEndTileNextToEntranceList(entranceTile) {
    const entranceTileNeighbours = this.getTileNeighbors(
      entranceTile.x,
      entranceTile.y
    );
    var validExitTiles = [];
    entranceTileNeighbours.forEach((tile) => {
      if (tile.building) {
        if (tile.building.type === "road") {
          if (tile.building.style === "end") {
            validExitTiles.push(tile);
          }
        }
      }
    });
    return validExitTiles;
  }

  /**
   * Find the list of tiles that have a building of ride type & has road access
   * @param {{x: number, y: number}} start
   * @param {number} maxDistance
   * @returns {Tile[]}
   */
  findRideTileList(start, maxDistance) {
    const filter = (tile) => {
      if (tile.building) {
        return tile.building?.type === "ride" && tile.building.hasRoadAccess;
      }
      return false;
    };
    const rideTiles = this.findTileList(start, filter, maxDistance);

    // update the waiting time of the rideTiles
    rideTiles.forEach((ride_tile) => {
      ride_tile.building.updateWaitingTime(this);
    });

    return rideTiles;
  }

  /**
   * Find the list of tiles that have a building of stand type & has road access
   * @param {{x: number, y: number}}} start
   * @param {number} maxDistance
   */
  findStandTileList(start, maxDistance) {
    const filter = (tile) => {
      if (tile.building) {
        return tile.building?.type === "stand" && tile.building.hasRoadAccess;
      }
      return false;
    };
    const standTiles = this.findTileList(start, filter, maxDistance);

    return standTiles;
  }

  /**
   * Find the list of tiles that belong to a specified thrill level
   * @param {{x: number, y: number}} start
   * @param {string} thrillLevel
   * @param {number} maxDistance
   * @returns {Tile[]}
   */
  findRideTileListThrillLevel(start, thrillLevel, maxDistance) {
    const filter = (tile) => {
      if (tile.building) {
        if (tile.building?.type === "ride") {
          return tile.building?.thrillLevel === thrillLevel;
        }
      }
      return false;
    };
    const rideTiles = this.findTileList(start, filter, maxDistance);

    return rideTiles;
  }

  /**
   * Find the list of tiles that has a building of stand type
   * @param {{x: number, y: number}} start
   * @param {number} maxDistance
   * @returns {Tile[]}
   */
  findStandTileList(start, maxDistance) {
    const filter = (tile) => {
      if (tile.building) {
        return tile.building?.type === "stand";
      }
      return false;
    };
    const rideTiles = this.findTileList(start, filter, maxDistance);

    return rideTiles;
  }

  /**
   * Finds and returns the neighbors of this tile
   * @param {number} x The x-coordinate of the tile
   * @param {number} y The y-coordinate of the tile
   */
  getTileNeighbors(x, y) {
    const neighbors = [];

    if (x > 0) {
      neighbors.push(this.getTile(x - 1, y));
    }
    if (x < this.size - 1) {
      neighbors.push(this.getTile(x + 1, y));
    }
    if (y > 0) {
      neighbors.push(this.getTile(x, y - 1));
    }
    if (y < this.size - 1) {
      neighbors.push(this.getTile(x, y + 1));
    }

    return neighbors;
  }
}
