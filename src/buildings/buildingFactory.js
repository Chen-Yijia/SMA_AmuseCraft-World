import { CommercialZone } from './commercialZone.js';
import { ResidentialZone } from './residentialZone.js';
import { IndustrialZone } from './industrialZone.js';
import { Road } from './road.js';
import { Building } from './building.js';
import { Visitor } from './visitor.js';
import { Ride } from './ride.js';
import { Stand } from './stand.js';

/**
 * Creates a new building object
 * @param {number} x The x-coordinate of the building
 * @param {number} y The y-coordinate of the building
 * @param {string} type The building type
 * @returns {Building} A new building object
 */
export function createBuilding(x, y, type) {
  switch (type) {
    case 'residential': 
      return new ResidentialZone(x, y);
    case 'commercial': 
      return new CommercialZone(x, y);
    case 'industrial': 
      return new IndustrialZone(x, y);
    case 'road': 
      return new Road(x, y);
    case 'visitor':
      return new Visitor(x,y);
    case 'ride':
      return new Ride(x,y);
    case 'stand':
      return new Stand(x,y);
    default:
      console.error(`${type} is not a recognized building type.`);
  }
}