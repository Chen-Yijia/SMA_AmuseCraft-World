import * as THREE from "three";
import { VehicleGraphNode } from "./vehicleGraphNode.js";
import config from "../config.js";
import { AssetManager } from "../assetManager.js";
import { Tile } from "../tile.js";
import { Ride } from "../buildings/ride.js";

const FORWARD = new THREE.Vector3(1, 0, 0);

const visitorThrillLevelMap = {
  "visitor-kid": "family",
  "visitor-elder": "family",
  "visitor-adult": "thrill"
}

export class Vehicle extends THREE.Group {
  constructor(origin, destination, visitorType, mesh) {
    super();

    this.vistorID = crypto.randomUUID();

    this.createdTime = Date.now();
    this.cycleStartTime = this.createdTime;
    this.leaveTime = Date.now();

    /**
     * @type {VehicleGraphNode}
     */
    this.origin = origin;

    /**
     * @type {VehicleGraphNode}
     */
    this.destination = destination;

    /**
     * @type {string}
     */
    this.visitorType = visitorType;

    /**
     * @type {string}
     */
    this.visitorName = generateRandomName();

    /**
     * @type {boolean}
     */
    this.isPaused = false; // if the visitor enters a ride, pause its mixer and pause updating its position.

    /**
     * @type {boolean}
     */
    this.isLeaving = false; // if the next destination of the visitor is the entrance and leave the space.

    /**
     * @type {Ride[]}
     */
    this.visitedRides = [];

    this.pauseStartTime = this.createdTime;

    this.originWorldPosition = new THREE.Vector3();
    this.destinationWorldPosition = new THREE.Vector3();
    this.originToDestination = new THREE.Vector3();
    this.orientation = new THREE.Vector3();

    this.add(mesh);

    this.updateWorldPositions();
  }

  /**
   * @returns {number} Returns cycle time between 0 and 1
   */
  getCycleTime() {
    const distance = this.originToDestination.length();
    const cycleDuration = distance / config.vehicle.speed;
    const cycleTime = (Date.now() - this.cycleStartTime) / cycleDuration;

    return Math.max(0, Math.min(cycleTime, 1));
  }

  /**
   * @returns {number} Age of the vehicle in milliseconds
   */
  getAge() {
    return Date.now() - this.createdTime;
  }

  /**
   * Updates the vehicle position each render frame
   * @param {AssetManager} assetManager
   */
  update(assetManager) {
    // If the visitor is paused, skip updating.
    if (this.isPaused) {
      return;
    }

    if (!this.origin || !this.destination) {
      this.dispose(assetManager);
      return;
    }

    // WIP (Temp). For now, do not dispose on max life
    // if (this.getAge() > config.vehicle.maxLifetime) {
    //   this.dispose(assetManager);
    //   return;
    // }

    const cycleTime = this.getCycleTime();
    if (cycleTime === 1) {
      // if the visitor is leaving and reached the destination
      if (this.isLeaving) {
        this.dispose(assetManager);
        return;
      }

      // otherwise, choose a new destination
      this.pickNewDestination();

      // TEMP for testing purpose
      // this.handleReachRideOrStand(assetManager);
    } else {
      this.position.copy(this.originWorldPosition);
      this.position.lerp(this.destinationWorldPosition, cycleTime);
    }

    this.updateOpacity();
  }

  updateOpacity() {
    const age = this.getAge();

    const setOpacity = (opacity) => {
      this.traverse((obj) => {
        if (obj.material) {
          obj.material.opacity = Math.max(0, Math.min(opacity, 1));
        }
      });
    };

    if (age < config.vehicle.fadeTime) {
      setOpacity(age / config.vehicle.fadeTime);
    } else if (config.vehicle.maxLifetime - age < config.vehicle.fadeTime) {
      setOpacity((config.vehicle.maxLifetime - age) / config.vehicle.fadeTime);
    } else {
      setOpacity(1);
    }
  }

  /**
   * handle the visitor behaviour when it reaches its destination of a ride or a stand
   * @param {AssetManager} assetManager
   */
  handleReachRideOrStand(assetManager) {
    const setOpacity = (opacity) => {
      this.traverse((obj) => {
        if (obj.material) {
          obj.material.opacity = Math.max(0, Math.min(opacity, 1));
        }
      });
    };

    const setFbxOpacity = (opacity) => {
      this.traverse((child) => {
        if (child.isMesh) {
          child.material.opacity = Math.max(0, Math.min(opacity, 1));
          child.material.transparent = true;
        }
      });
    };

    // update origin & destination
    this.origin = this.destination;
    this.destination = this.destination;
    this.updateWorldPositions();

    // set the vehicle pause
    this.isPaused = true;
    this.pauseStartTime = Date.now();

    // update mixer to remove the mesh
    const thisMesh = this.children[0];
    console.log(thisMesh);
    assetManager.mixers = Object.keys(assetManager.mixers)
      .filter((objKey) => objKey !== thisMesh.uuid)
      .reduce((newObj, key) => {
        newObj[key] = assetManager.mixers[key];
        return newObj;
      }, {});

    // update opacity (not working)
    setFbxOpacity(0.5);

    // hide the visitor
    // this.children[0].visible = false;
  }

  pickNewDestination() {
    this.origin = this.destination;
    this.destination = this.origin?.getRandomNextNode();
    this.updateWorldPositions();
    this.cycleStartTime = Date.now();
  }

  /**
   * Find the path from the origin to its next destination
   * The next destination (graghNode) has to fulfill the following conditions
   * 1. the node is next to a Ride tile
   * 2. the ride thrill level matches the visitor profile
   * 3. the ride has not be visited before
   * Optional (4. the ride is within the max_search_distance)
   * 
   * The function returns the details for visitor's next destination. Or Null, suggesting the visitor is leaving
   * @param {VehicleGraphNode} origin
   * @param {Tile[]} rideTiles
   * @returns {{nextRide: Ride, destinationNode: VehicleGraphNode, pathToDestination: VehicleGraphNode[]} | null}
   */
  findNextRidePath(origin, rideTiles) {
    if (!rideTiles) {
      console.log(`early return find next ride for ${this.name} -- no eligible ride tiles.`)
      return null;
    }

    // filter for non-vistied ride tiles
    const notVisitedRideTiles = rideTiles.filter((ride_tile) => !this.getVisitedRideSubTypes().includes(ride_tile.building.subType));
    if (!notVisitedRideTiles) {
      console.log(`early return find next ride for ${this.name} -- all visited.`)
      return null;
    }

    // filter for matching thrill levels
    const targetThrillLevel = visitorThrillLevelMap[this.visitorType];
    const targetRideTiles = notVisitedRideTiles.filter((ride_tile) => ride_tile.building.thrillLevel === targetThrillLevel);
    if (!targetRideTiles) {
      console.log(`early return find next ride for ${this.name} -- no target thrill level rides.`)
      return null;
    }

    // randomly select a Ride with all the above conditions satisfied. 
    const i = Math.floor(targetRideTiles.length * Math.random());
    const targetRideTile = targetRideTiles[i];

    // run BFS to get the path to targetRide
    const {destinationNode, pathToDestination} = this.searchBFS(origin, targetRideTile);
    if (pathToDestination === null) {
      console.log(`early return find next ride for ${this.name} -- could not find path to target ride ${targetRide.building.subType}`)
      return null;
    }

    // return the result
    return {nextRide: targetRideTile.building, destinationNode: destinationNode, pathToDestination: pathToDestination}
  }

  /**
   * Run BFS search from origin to targetRideTile
   * @param {VehicleGraphNode} origin 
   * @param {Tile} targetRideTile 
   * @returns {{destinationNode: VehicleGraphNode|null, pathToDestination: VehicleGraphNode[]|null}}
   */
  searchBFS(origin, targetRideTile){
    let nodesToSearch = [[origin, []]]; // initialise the queue to include the origin
    let exploredNodes = new Set;

    while (nodesToSearch.length > 0) {
      let [currentNode, [...path]] = nodesToSearch.shift();
      path.push(currentNode);
      if ((currentNode.tilePosition.x === targetRideTile.x) && (currentNode.tilePosition.y === targetRideTile.y)) {
        return {destinationNode: currentNode, pathToDestination: path};
      } 
      if ((!exploredNodes.has(currentNode)) && (currentNode.next.length > 0)) {
        nodesToSearch.push(currentNode.next.map((node) => [node, path]));
      }
      exploredNodes.add(currentNode);
    }

    return {destinationNode: null, pathToDestination: null};
  }

  /**
   * Get the ride subtypes that the visitor has visited
   * @returns {string[]}
   */
  getVisitedRideSubTypes() {
    const visitedRideSubTypes = this.visitedRides.map((ride) => ride.subType);
    return visitedRideSubTypes;
  }

  /**
   * Updates the world positions each cycle start
   */
  updateWorldPositions() {
    if (!this.origin || !this.destination) {
      return;
    }

    this.origin.getWorldPosition(this.originWorldPosition);
    this.destination.getWorldPosition(this.destinationWorldPosition);

    this.originToDestination.copy(this.destinationWorldPosition);
    this.originToDestination.sub(this.originWorldPosition);

    this.orientation.copy(this.originToDestination);
    this.orientation.normalize();

    this.quaternion.setFromUnitVectors(FORWARD, this.orientation);
  }

  /**
   *
   * @param {AssetManager} assetManager
   */
  dispose(assetManager) {
    console.log("to dispose (uuid)", this.children[0].uuid);
    // this.traverse((obj) => obj.material?.dispose()); // for obj (vehicle)

    // remove the mixer (for visitor)
    // update mixer to remove the mesh
    const thisMesh = this.children[0];
    assetManager.mixers = Object.keys(assetManager.mixers)
      .filter((objKey) => objKey !== thisMesh.uuid)
      .reduce((newObj, key) => {
        newObj[key] = assetManager.mixers[key];
        return newObj;
      }, {});

    this.removeFromParent();
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

  toHTML() {
    return `
      <li class="info-citizen">
        <span class="info-citizen-name">${this.visitorName}</span>
        <br>
        <span class="info-citizen-details">
          <span>
            ${this.visitorType} 
          </span>
        </span>
      </li>
    `;
  }
}

function generateRandomName() {
  const firstNames = [
    "Emma",
    "Mason",
    "Olivia",
    "Liam",
    "Ava",
    "Noah",
    "Sophia",
    "Jackson",
    "Isabella",
    "Aiden",
    "Mia",
    "Lucas",
    "Amelia",
    "Caleb",
    "Harper",
    "Benjamin",
    "Evelyn",
    "Samuel",
    "Abigail",
    "Henry",
    "Emily",
    "Wyatt",
    "Scarlett",
    "Andrew",
    "Madison",
    "Gabriel",
    "Chloe",
    "Owen",
    "Grace",
    "Levi",
    "Lily",
    "James",
    "Aria",
    "Isaac",
    "Riley",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Garcia",
    "Martinez",
    "Robinson",
    "Clark",
    "Rodriguez",
    "Lewis",
    "Lee",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "Hernandez",
    "King",
    "Wright",
    "Lopez",
    "Hill",
    "Scott",
    "Green",
    "Adams",
    "Baker",
    "Gonzalez",
    "Nelson",
    "Carter",
    "Mitchell",
    "Perez",
    "Roberts",
    "Turner",
    "Phillips",
    "Campbell",
    "Parker",
    "Evans",
    "Edwards",
    "Collins",
    "Stewart",
    "Sanchez",
    "Morris",
    "Rogers",
    "Reed",
    "Cook",
    "Morgan",
    "Bell",
    "Murphy",
    "Bailey",
    "Rivera",
    "Cooper",
    "Richardson",
    "Cox",
    "Howard",
    "Ward",
  ];

  const randomFirstName =
    firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName =
    lastNames[Math.floor(Math.random() * lastNames.length)];

  return randomFirstName + " " + randomLastName;
}
