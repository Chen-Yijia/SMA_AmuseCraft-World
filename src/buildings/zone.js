import { defaultConfig, updateConfig } from "../config.js";
import { Building } from "./building.js";

/**
 * Represents a zoned building such as residential, commercial or industrial
 */
var config = { ...defaultConfig };

export class Zone extends Building {
  constructor(x, y) {
    super(x, y);
    this.rotation = 90 * Math.floor(4 * Math.random());

    /**
     * The mesh style to use when rendering
     */
    this.style = "";

    /**
     * True if this zone has access to a road
     */
    this.hasRoadAccess = false;
  }

  /**
   * Updates the state of this building by one simulation step
   * @param {City} city
   */
  step(city) {
    super.step(city);
    config = { ...updateConfig() };

    this.checkDevelopmentCriteria(city);
  }

  /**
   * Returns true if this zone is able to be developed
   */
  checkDevelopmentCriteria(city) {
    this.checkRoadAccess(city);
    return this.hasRoadAccess;
  }

  /**
   * Checks nearby tiles to see if a road is available. This check
   * is only triggered when `refresh()` is called.
   * @param {City} city
   */
  checkRoadAccess(city) {
    config = { ...updateConfig() };
    const road = city.findTile(
      this,
      (tile) => {
        return tile.building?.type === "road";
      },
      config.zone.maxRoadSearchDistance
    );

    if (road) {
      this.hasRoadAccess = true;
    } else {
      this.hasRoadAccess = false;
    }
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `
    `;
    // html += `
    // <span class="info-label">Style </span>
    // <span class="info-value">${this.style}</span>
    // <br>
    // <span class="info-label">Road Access </span>
    // <span class="info-value">${this.hasRoadAccess}</span>
    // <br>
    // `;
    return html;
  }
}
