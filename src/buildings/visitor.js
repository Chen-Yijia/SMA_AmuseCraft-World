import { City } from "../city.js";
import { Zone } from "./zone.js";

export class Visitor extends Zone {
  constructor(x, y) {
    super(x, y);
    this.name = "visitor";
    this.type = "visitor";
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
