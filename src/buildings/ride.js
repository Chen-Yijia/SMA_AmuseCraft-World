import { Citizen } from '../citizens.js';
import { City } from '../city.js';
import config from '../config.js';
import { Zone } from './zone.js';

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
}

export class Ride extends Zone {
  constructor(x, y, subType) {
    super(x, y);
    this.name = "ride";
    this.type = 'ride';
    this.subType = subType;
    this.thrillLevel = thrillLevelMapping[subType];
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
    `
    return html;
  }
}