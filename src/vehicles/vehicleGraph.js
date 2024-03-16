import * as THREE from "three";
import {
  CornerRoadTile,
  EndRoadTile,
  FourWayRoadTile,
  StraightRoadTile,
  ThreeWayRoadTile,
  VehicleGraphTile,
} from "./vehicleGraphTile.js";
import { VehicleGraphHelper } from "./vehicleGraphHelper.js";
import { AssetManager } from "../assetManager.js";
import config from "../config.js";
import { Vehicle } from "./vehicle.js";
import { Road } from "../buildings/road.js";
import { City } from "../city.js";
import { Tile } from "../tile.js";

export class VehicleGraph extends THREE.Group {
  constructor(size, assetManager, city) {
    super();

    this.size = size;

    /**
     * @type {AssetManager}
     */
    this.assetManager = assetManager;

    /**
     * @type {City}
     */
    this.city = city;

    /**
     * @type {VehicleGraphTile[][]}
     */
    this.tiles = [];

    this.vehicles = new THREE.Group();
    this.add(this.vehicles);

    /**
     * @type {VehicleGraphHelper}
     */
    this.helper = new VehicleGraphHelper(); // to visualise the nodes/direction
    // this.add(this.helper); // Comment out for actual project delivery

    // Initialize the vehicle graph tiles array
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        column.push(null);
      }
      this.tiles.push(column);
    }

    this.helper.update(this);

    this.spawnVehicle();
    // setInterval(this.spawnVehicle.bind(this), config.vehicle.spawnInterval);
  }

  updateVehicles() {
    // fetch the most updated RideTiles
    const rideTiles = this.city.findRideTileList(
      { x: this.size / 2, y: this.size / 2 },
      100
    ); // to find all ride tiles

    // fetch the most updated entrance
    const entranceTile = this.city.findEntranceTile(
      { x: this.size / 2, y: this.size / 2 },
      100
    ); // to guarantee find the entrance tile

    // fetch the most updated standTiles
    const standTiles = this.city.findStandTileList(
      { x: this.size / 2, y: this.size / 2 },
      100
    ); // to find all stand tiles

    for (const vehicle of this.vehicles.children) {
      vehicle.update(this.assetManager, rideTiles, entranceTile, standTiles);
    }
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {Road | null} road
   */
  updateTile(x, y, road) {
    console.log(`updating vehicle graph at (x: ${x}, y: ${y})`);

    const existingTile = this.getTile(x, y);
    const leftTile = this.getTile(x - 1, y);
    const rightTile = this.getTile(x + 1, y);
    const topTile = this.getTile(x, y - 1);
    const bottomTile = this.getTile(x, y + 1);

    // Disconnect the existing tile and all adjacent tiles from each other
    existingTile?.disconnectAll();
    leftTile?.getWorldRightSide()?.out?.disconnectAll();
    rightTile?.getWorldLeftSide()?.out?.disconnectAll();
    topTile?.getWorldBottomSide()?.out?.disconnectAll();
    bottomTile?.getWorldTopSide()?.out?.disconnectAll();

    if (road) {
      const tile = VehicleGraphTile.create(x, y, road.rotation, road.style);

      // Connect tile to adjacent tiles
      if (leftTile) {
        tile.getWorldLeftSide().out?.connect(leftTile.getWorldRightSide().in);
        leftTile.getWorldRightSide().out?.connect(tile.getWorldLeftSide().in);
      }
      if (rightTile) {
        tile.getWorldRightSide().out?.connect(rightTile.getWorldLeftSide().in);
        rightTile.getWorldLeftSide().out?.connect(tile.getWorldRightSide().in);
      }
      if (topTile) {
        tile.getWorldTopSide().out?.connect(topTile.getWorldBottomSide().in);
        topTile.getWorldBottomSide().out?.connect(tile.getWorldTopSide().in);
      }
      if (bottomTile) {
        tile.getWorldBottomSide().out?.connect(bottomTile.getWorldTopSide().in);
        bottomTile.getWorldTopSide().out?.connect(tile.getWorldBottomSide().in);
      }

      this.tiles[x][y] = tile;
      this.add(tile);
    } else {
      this.tiles[x][y] = null;
    }

    // Update the vehicle graph visualization
    this.helper.update(this);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {VehicleGraphTile}
   */
  getTile(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.tiles[x][y];
    } else {
      return null;
    }
  }

  spawnVehicle() {
    // random spawn interval from uniform distribution
    var randomSpawnInterval = Math.floor(
      Math.random() *
        (config.vehicle.spawnIntervalMax -
          config.vehicle.spawnIntervalMin +
          1) +
        config.vehicle.spawnIntervalMin
    );
    console.log("Wait for " + randomSpawnInterval / 1000 + " seconds");
    setTimeout(this.spawnVehicle.bind(this), randomSpawnInterval);
    if (this.city.currentSimulationTime === 0 || !this.city.simulatedStarted) {
      return;
    }
    console.log("spawning visitor");
    if (this.vehicles.children.length < config.vehicle.maxVehicleCount) {
      const startingTile = this.getStartingTile(this.city);

      if (startingTile != null) {
        const origin = startingTile.getRandomNode();
        // const destination = origin?.getRandomNextNode();

        // if (origin && destination) {
        if (origin) {
          // decide which visitor profile to generate
          const randomNumber = Math.random();
          let visitorType;
          if (randomNumber <= config.vehicle.probAdult) {
            visitorType = "visitor-adult";
          } else if (
            randomNumber <=
            config.vehicle.probAdult + config.vehicle.probKid
          ) {
            visitorType = "visitor-kid";
          } else {
            visitorType = "visitor-elder";
          }

          // fetch the most updated RideTiles
          const rideTiles = this.city.findRideTileList(
            { x: this.size / 2, y: this.size / 2 },
            100
          ); // to find all ride tiles
          // fetch the most updated entrance
          const entranceTile = this.city.findEntranceTile(
            { x: this.size / 2, y: this.size / 2 },
            100
          ); // to guarantee find the entrance tile
          // fetch the most updated standTiles
          const standTiles = this.city.findStandTileList(
            { x: this.size / 2, y: this.size / 2 },
            100
          ); // to find all stand tiles

          const vehicle = new Vehicle(
            origin,
            // destination,
            visitorType,
            this.assetManager.createRandomVisitorMesh(visitorType),
            // this.assetManager.createRandomVehicleMesh()
            rideTiles,
            entranceTile,
            standTiles
          );

          console.log("creating new visitor");

          this.vehicles.add(vehicle);
        }
      }
    } else {
      console.log("maximum number of visitors met, not spawning a visitor");
    }
  }

  /**
   * Gets a random tile for a vehicle to spawn at
   * @param {City} city
   * @returns {VehicleGraphTile | null}
   */
  getStartingTile(city) {
    const tiles = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        let tile = this.getTile(x, y);
        // check through the tiles and let the starting tile being the ones that next to
        // the entrance.
        // additionally, the starting tile has to be an end tile
        if (
          tile &&
          this.checkNextToEntrance(x, y, city) &&
          this.checkIsEndTile(x, y, city)
        )
          tiles.push(tile);
      }
    }

    // console.log("valid starting tile", tiles);

    if (tiles.length === 0) {
      return null;
    } else {
      const i = Math.floor(tiles.length * Math.random());
      return tiles[i];
    }
  }

  /**
   * Conver city tile to vehicle graph tile
   * @param {Tile[]} cityTiles
   */
  convertCityTileToGraphTile(cityTiles) {
    const graphTiles = [];
    cityTiles.forEach((cityTile) => {
      graphTiles.push(this.getTile(cityTile.x, cityTile.y));
    });
    return graphTiles;
  }

  /**
   * Check if the tile is next to the entrnce
   * @param {City} city
   * @param {number} x
   * @param {number} y
   */
  checkNextToEntrance(x, y, city) {
    let leftTile = city.getTile(x - 1, y);
    let rightTile = city.getTile(x + 1, y);
    let topTile = city.getTile(x, y + 1);
    let bottomTile = city.getTile(x, y - 1);

    const filter = (tile) => {
      if (tile.building) {
        return tile.building?.type === "entrance";
      }
      return false;
    };

    return (
      filter(leftTile) ||
      filter(rightTile) ||
      filter(topTile) ||
      filter(bottomTile)
    );
  }

  /**
   * Check if the tile is an end tile
   * @param {City} city
   * @param {number} x
   * @param {number} y
   */
  checkIsEndTile(x, y, city) {
    let thisTile = city.getTile(x, y);
    let isEndTile = false;

    if (thisTile.building?.type === "road") {
      if (thisTile.building?.style === "end") {
        isEndTile = true;
      }
    }
    return isEndTile;
  }
}
