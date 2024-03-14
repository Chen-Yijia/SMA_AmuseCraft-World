import * as THREE from "three";
import { VehicleGraphNode } from "./vehicleGraphNode.js";
import config from "../config.js";
import { AssetManager } from "../assetManager.js";
import { Tile } from "../tile.js";
import { Ride } from "../buildings/ride.js";
import { City } from "../city.js";

const FORWARD = new THREE.Vector3(1, 0, 0);

const visitorThrillLevelMap = {
  "visitor-kid": ["family"],
  "visitor-elder": ["family"],
  "visitor-adult": ["thrill", "family"],
};

export class Vehicle extends THREE.Group {
  constructor(origin, visitorType, mesh, rideTiles, entranceTile) {
    super();

    this.vistorID = crypto.randomUUID();

    this.createdTime = Date.now();
    this.cycleStartTime = this.createdTime;
    this.leaveTime = Date.now();

    /**
     * @type {string}
     */
    this.visitorType = visitorType;

    /**
     * @type {string}
     */
    this.visitorName = generateRandomName();

    /**
     * @type {VehicleGraphNode}
     */
    this.origin = origin;

    /**
     * @type {VehicleGraphNode}
     */
    this.destination = origin; // initialise for now, will update below

    /**
     * @type {VehicleGraphNode}
     */
    this.finalDestinationRideNode = origin; // initialise for now, will update below

    /**
     * @type {Tile}
     */
    this.finalDestinationRideTile = new Tile(
      origin.tilePosition.x,
      origin.tilePosition.y
    ); // initialise for now, will update below

    /**
     * @type {VehicleGraphNode[]}
     */
    this.pathToDestinationRideNode = []; // initialise for now, will update below

    /**
     * @type {Tile[]}
     */
    this.rideTiles = rideTiles; // useful when gets released from the ride.

    /**
     * @type {Tile}
     */
    this.entranceTile = entranceTile; // useful when the visitor is going to leave the park

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

    // run BFS to find the final destination and the path.
    const nextRideTarget = this.findNextRidePath(origin, this.rideTiles);
    if (nextRideTarget == null) {
      // meaning the visitor has no where to go
      this.isLeaving = true;
      this.destination = null; // setting it to null will remove the visitor in the next update cycle.
    } else {
      console.log(
        "next ride target",
        nextRideTarget.nextRideTile.building.subType
      );
      this.finalDestinationRideNode = nextRideTarget.destinationNode;
      this.finalDestinationRideTile = nextRideTarget.nextRideTile;
      this.pathToDestinationRideNode = nextRideTarget.pathToDestination;
      this.destination = this.pathToDestinationRideNode[1]; // the second item as the first item is the origin
    }

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
   * @param {Tile[]} rideTiles
   * @param {Tile} entranceTile
   */
  update(assetManager, rideTiles, entranceTile) {
    this.rideTiles = rideTiles;
    this.entranceTile = entranceTile;

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
        if (this.pathToDestinationRideNode.length === 0) {
          this.leaveTime = Date.now();
          this.dispose(assetManager);
          return;
        } else {
          this.pickNextExitDestination();
        }
      } else {
        // otherwise, choose a new destination
        this.pickNewDestination();
      }
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
   */
  handleReachRideOrStand() {
    const setFbxOpacity = (opacity) => {
      this.traverse((child) => {
        if (child.isMesh) {
          child.material.opacity = Math.max(0, Math.min(opacity, 1));
          child.material.transparent = true;
        }
      });
    };

    // 1. update origin & destination
    this.origin = this.destination;
    this.destination = this.destination;
    this.updateWorldPositions();

    // 2. set the vehicle pause
    this.isPaused = true;
    this.pauseStartTime = Date.now();

    // update mixer to remove the mesh -- UPDATE: do not remove the mixer, hide/give opacity to the visitor instead
    // const thisMesh = this.children[0];
    // // console.log(thisMesh);
    // assetManager.mixers = Object.keys(assetManager.mixers)
    //   .filter((objKey) => objKey !== thisMesh.uuid)
    //   .reduce((newObj, key) => {
    //     newObj[key] = assetManager.mixers[key];
    //     return newObj;
    //   }, {});

    // 3. Apply mesh modifications
    // update opacity (not working)
    setFbxOpacity(0.5);
    // hide the visitor
    // this.children[0].visible = false;

    // 4. Append the visitor into the Ride
    let targetRideTile = this.finalDestinationRideTile;
    targetRideTile.building.waitingVisitors.push(this);
  }

  /**
   * function to be called for picking the next destination for visitors with isLeaving=true
   */
  pickNextExitDestination() {
    this.origin = this.destination;
    this.destination = this.pathToDestinationRideNode.shift();
    this.updateWorldPositions();
    this.cycleStartTime = Date.now();
  }

  /**
   * Move to next node in the path OR handle reached ride destination
   */
  pickNewDestination() {
    // Case 1: if there is still node in the pathToDestination
    if (this.pathToDestinationRideNode.length > 0) {
      // Assign destination to origin
      this.origin = this.destination;
      // Shift the pathToDestination
      this.destination = this.pathToDestinationRideNode.shift();
      // Update position and cycle time
      this.updateWorldPositions();
      this.cycleStartTime = Date.now();
    }

    // Case 2: if has reached the final destination ride, handle reached Ride
    else {
      // // double check the destination is the finalRideDestinationNode
      // console.log(
      //   "double check is next to ride node",
      //   this.destination.tilePosition,
      //   this.finalDestinationRideTile.x,
      //   this.finalDestinationRideTile.y
      // );

      // handle reach the ride node
      this.handleReachRideOrStand();
    }

    // --------- OUTDATED ---------
    // this.origin = this.destination;
    // this.destination = this.origin?.getRandomNextNode();
    // this.updateWorldPositions();
    // this.cycleStartTime = Date.now();
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
   * @returns {{nextRideTile: Tile, destinationNode: VehicleGraphNode, pathToDestination: VehicleGraphNode[]} | null}
   */
  findNextRidePath(origin, rideTiles) {
    if (rideTiles.length == 0) {
      console.log(
        `early return find next ride for ${this.name} -- no eligible ride tiles.`
      );
      return null;
    }

    // filter for non-vistied ride tiles
    const notVisitedRideTiles = rideTiles.filter(
      (ride_tile) =>
        !this.getVisitedRideSubTypes().includes(ride_tile.building.subType)
    );
    if (notVisitedRideTiles.length == 0) {
      console.log(
        `early return find next ride for ${this.name} -- all visited.`
      );
      return null;
    }

    // filter for matching thrill levels
    const targetThrillLevels = visitorThrillLevelMap[this.visitorType];
    const targetRideTiles = notVisitedRideTiles.filter((ride_tile) =>
      targetThrillLevels.includes(ride_tile.building.thrillLevel)
    );
    if (targetRideTiles.length == 0) {
      console.log(
        `early return find next ride for ${this.name} -- no target thrill level rides.`
      );
      return null;
    }

    // randomly select a Ride with all the above conditions satisfied.
    const i = Math.floor(targetRideTiles.length * Math.random());
    const targetRideTile = targetRideTiles[i];

    // run BFS to get the path to targetRide
    const { destinationNode, pathToDestination } = this.searchBFS(
      origin,
      targetRideTile
    );
    if (pathToDestination === null) {
      console.log(
        `early return find next ride for ${this.name} -- could not find path to target ride ${targetRideTile.building.subType}`
      );
      return null;
    }

    // return the result
    return {
      nextRideTile: targetRideTile,
      destinationNode: destinationNode,
      pathToDestination: pathToDestination,
    };
  }

  /**
   * Find the entrance tile & the path from origin to a node next to the entrance tile
   * @param {VehicleGraphNode} origin
   * @param {Tile} entranceTile
   * @returns {{entranceTile: Tile, destinationNode: VehicleGraphNode, pathToDestination: VehicleGraphNode[]} | null}
   */
  findExitPath(origin, entranceTile) {
    const { destinationNode, pathToDestination } = this.searchBFS(
      origin,
      entranceTile
    );

    // if by correct setup, there must exist a path to the entrance,
    // but here we also do the check in case of wrong setup.
    if (pathToDestination == null) {
      console.log(
        `early dispose visitor ${this.name} since did not find a path to entrance`
      );
      return null;
    }

    return {
      entranceTile: entranceTile,
      destinationNode: destinationNode,
      pathToDestination: pathToDestination,
    };
  }

  /**
   * Run BFS search from origin to targetRideTile
   * @param {VehicleGraphNode} origin
   * @param {Tile} targetRideTile
   * @returns {{destinationNode: VehicleGraphNode|null, pathToDestination: VehicleGraphNode[]|null}}
   */
  searchBFS(origin, targetRideTile) {
    /**
     * Check if a test node is next to the target ride tile
     * @param {VehicleGraphNode} testNode
     * @param {Tile} targetRideTile
     * @type {boolean}
     */
    const checkNextToRide = (testNode, targetRideTile) => {
      let testNode_x = testNode.tilePosition.x;
      let testNode_y = testNode.tilePosition.y;
      // check left
      if (
        testNode_x - 1 === targetRideTile.x &&
        testNode_y === targetRideTile.y
      ) {
        return true;
      }
      // check right
      if (
        testNode_x + 1 === targetRideTile.x &&
        testNode_y === targetRideTile.y
      ) {
        return true;
      }
      // check up
      if (
        testNode_x === targetRideTile.x &&
        testNode_y + 1 === targetRideTile.y
      ) {
        return true;
      }
      // check bottom
      if (
        testNode_x === targetRideTile.x &&
        testNode_y - 1 === targetRideTile.y
      ) {
        return true;
      }
      return false;
    };

    /**
     * @type {{current: VehicleGraphNode, path: VehicleGraphNode[]}}
     */
    let bfsSearchNode = { current: origin, path: [] };

    let nodesToSearch = [bfsSearchNode]; // initialise the queue to include the origin
    let exploredNodes = new Set();

    while (nodesToSearch.length > 0) {
      let shiftedItem = nodesToSearch.shift();
      let currentNode = shiftedItem.current;
      let path = [...shiftedItem.path];

      path.push(currentNode);
      if (checkNextToRide(currentNode, targetRideTile)) {
        return { destinationNode: currentNode, pathToDestination: path };
      }
      if (!exploredNodes.has(currentNode) && currentNode.next.length > 0) {
        nodesToSearch.push(
          ...currentNode.next.map((node) => {
            let objectToAddQueue = {
              current: node,
              path: path,
            };
            return objectToAddQueue;
          })
        );
      }
      exploredNodes.add(currentNode);
    }

    return { destinationNode: null, pathToDestination: null };
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
            <img class="info-citizen-icon" src="/public/icons/age-group.png">
            ${this.visitorType} 
          </span>

          <span>
            <img class="info-citizen-icon" src="/public/icons/amusement-park.png">
            ${this.visitedRides.map((ride) => ride.subType).join(", ")} 
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
