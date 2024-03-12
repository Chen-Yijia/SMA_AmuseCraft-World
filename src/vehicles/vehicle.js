import * as THREE from "three";
import { VehicleGraphNode } from "./vehicleGraphNode.js";
import config from "../config.js";

const FORWARD = new THREE.Vector3(1, 0, 0);

export class Vehicle extends THREE.Group {
  constructor(origin, destination, visitorType, mesh) {
    super();

    this.vistorID = crypto.randomUUID();

    this.createdTime = Date.now();
    this.cycleStartTime = this.createdTime;

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
   */
  update() {
    if (!this.origin || !this.destination) {
      this.dispose();
      return;
    }

    // WIP (Temp). For now, do not dispose on max life
    // if (this.getAge() > config.vehicle.maxLifetime) {
    //   this.dispose();
    //   return;
    // }

    const cycleTime = this.getCycleTime();
    if (cycleTime === 1) {
      this.pickNewDestination();
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

  pickNewDestination() {
    this.origin = this.destination;
    this.destination = this.origin?.getRandomNextNode();
    this.updateWorldPositions();
    this.cycleStartTime = Date.now();
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

  dispose() {
    console.log("to dispose (uuid)", this.children[0].uuid);
    // this.traverse((obj) => obj.material?.dispose()); // for obj (vehicle)
    this.removeFromParent();

    // remove the mixer (for visitor)
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

  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return randomFirstName + ' ' + randomLastName;
}
