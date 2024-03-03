import { Citizen } from '../citizens.js';
import { City } from '../city.js';
import config from '../config.js';
import { Zone } from './zone.js';

export class Stand extends Zone {
  constructor(x, y, subType) {
    super(x, y);
    this.name = "stand";
    this.type = 'stand';
    this.subType = subType;
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
    return html;
  }
}