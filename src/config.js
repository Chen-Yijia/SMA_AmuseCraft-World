var defaultConfig = {
  citizen: {
    minWorkingAge: 16, // Minimum working age for a citizen
    retirementAge: 65, // Age when citizens retire
    maxJobSearchDistance: 4, // Max distance a citizen will search for a job
  },
  vehicle: {
    speed: 0.0005, // The distance travelled per millisecond
    fadeTime: 1000, // The start/end time where the vehicle should fade
    maxLifetime: 10000, // Maximum lifetime of a vehicle
    maxVehicleCount: 20, // Maximum number of vehicles in scene at any one time
    spawnIntervalMin: 6000, // How often vehicles are spawned in milliseconds
    spawnIntervalMax: 14000, // How often vehicles are spawned in milliseconds
    probAdult: 0.6, // probability that the visitor is adult
    probKid: 0.2, // probability that the visitor is kid
    probElder: 0.2, // probability that the visitor is elder
    maxStandVisitCount: 3, // set the max number of stands a visitor can go
    maxWaitTolerance: 40, // set the max tolerance for waiting time.
  },
  zone: {
    abandonmentThreshold: 10, // Number of days before abandonment
    abandonmentChance: 0.25, // Probability of building abandonment
    developmentChance: 0.25, // Probability of building development
    maxRoadSearchDistance: 1, // Max distance between buildng and road
    maxResidents: 2, // Max # of residents in a house
    maxWorkers: 2, // Max # of workers at a building
    residentMoveInChance: 0.5, // Chance for a resident to move in
  },
  road: {
    costPerTile: 500, // The construction cost to build a road tile
  },
  ride: {
    maxRideSearchDistance: 32, // Max distance a visitor will search for a ride
    costInstallation: {
      "circus-tent": 200,
      "water-ride": 300,
      "bumper-car": 200,
      "ferris-wheel": 350,
      roundabout: 250,
      carousel: 200,
      "swing-claw": 300,
      "space-adventure": 250,
      rollercoaster: 300,
      arcade: 200,
    },
    ticketPrice: {
      "circus-tent": 3,
      "water-ride": 5,
      "bumper-car": 5,
      "ferris-wheel": 3,
      roundabout: 3,
      carousel: 3,
      "swing-claw": 5,
      "space-adventure": 3,
      rollercoaster: 5,
      arcade: 3,
    },
    thrillLevel: {
      "circus-tent": "family",
      "water-ride": "thrill",
      "bumper-car": "thrill",
      "ferris-wheel": "family",
      roundabout: "family",
      carousel: "family",
      "swing-claw": "thrill",
      "space-adventure": "thrill",
      rollercoaster: "thrill",
      arcade: "family",
    },
    rideDuration: {
      // The duration should be in seconds
      "circus-tent": 40,
      "water-ride": 10,
      "bumper-car": 8,
      "ferris-wheel": 15,
      roundabout: 8,
      carousel: 5,
      "swing-claw": 8,
      "space-adventure": 12,
      rollercoaster: 8,
      arcade: 20,
    },
    rideCapacity: {
      // scale down from actual, as each visitor in this set up represents more than 1 visitor in real life
      // scale down by 10 for now
      "circus-tent": 4,
      "water-ride": 2,
      "bumper-car": 2,
      "ferris-wheel": 2,
      roundabout: 1,
      carousel: 1,
      "swing-claw": 2,
      "space-adventure": 1,
      rollercoaster: 2,
      arcade: 3,
    },
    operationalCost: {
      // The operational cost per min (per simulation time (1 s))
      "circus-tent": 0.2,
      "water-ride": 0.2,
      "bumper-car": 0.1,
      "ferris-wheel": 0.2,
      roundabout: 0.1,
      carousel: 0.1,
      "swing-claw": 0.2,
      "space-adventure": 0.2,
      rollercoaster: 0.2,
      arcade: 0.1,
    },
  },
  stand: {
    costInstallation: {
      "hot-dog": 120,
      burger: 150,
      cafe: 250,
      "chinese-restaurant": 350,
      "ice-cream": 100,
    },
    operationalCost: {
      "hot-dog": 0.1,
      burger: 0.1,
      cafe: 0.1,
      "chinese-restaurant": 0.1,
      "ice-cream": 0.1,
    },
    arpcMean: {
      // Average Revenue Per Customer
      "hot-dog": 2,
      burger: 7,
      cafe: 8,
      "chinese-restaurant": 15,
      "ice-cream": 1,
    },
    arpcSd: {
      // Average Revenue Per Customer
      "hot-dog": 0.5,
      burger: 1,
      cafe: 2,
      "chinese-restaurant": 4,
      "ice-cream": 0.2,
    },
    purchaseOpportunity: {
      "hot-dog": 0.3,
      burger: 0.2,
      cafe: 0.1,
      "chinese-restaurant": 0.1,
      "ice-cream": 0.3,
    },
    timeToSpendMean: {
      // in milliseconds
      "hot-dog": 1,
      burger: 5,
      cafe: 20,
      "chinese-restaurant": 30,
      "ice-cream": 1,
    },
    timeToSpendSd: {
      // in milliseconds
      "hot-dog": 0.5,
      burger: 2,
      cafe: 8,
      "chinese-restaurant": 10,
      "ice-cream": 0.5,
    },
  },
};

function updateConfig() {
  var updatedConfig = { ...defaultConfig }; // based on the default config

  // visitor setting
  updatedConfig.vehicle.maxVehicleCount = Number(
    document.getElementById("maxVehicleCount").value
  );
  updatedConfig.vehicle.maxStandVisitCount = Number(
    document.getElementById("maxStandVisitCount").value
  );
  updatedConfig.vehicle.maxWaitTolerance = Number(
    document.getElementById("maxWaitTolerance").value
  );
  updatedConfig.vehicle.spawnIntervalMin = Number(
    document.getElementById("spawnIntervalMin").value
  );
  updatedConfig.vehicle.spawnIntervalMax = Number(
    document.getElementById("spawnIntervalMax").value
  );
  updatedConfig.vehicle.probAdult = Number(
    document.getElementById("probAdult").value
  );
  updatedConfig.vehicle.probKid = Number(
    document.getElementById("probKid").value
  );
  updatedConfig.vehicle.probElder = Number(
    document.getElementById("probElder").value
  );

  // ride setting
  // cost installation
  updatedConfig.ride.costInstallation["circus-tent"] = Number(
    document.getElementById("costInstallation-circus-tent").value
  );
  updatedConfig.ride.costInstallation["water-ride"] = Number(
    document.getElementById("costInstallation-water-ride").value
  );
  updatedConfig.ride.costInstallation["bumper-car"] = Number(
    document.getElementById("costInstallation-bumper-car").value
  );
  updatedConfig.ride.costInstallation["ferris-wheel"] = Number(
    document.getElementById("costInstallation-ferris-wheel").value
  );
  updatedConfig.ride.costInstallation.roundabout = Number(
    document.getElementById("costInstallation-roundabout").value
  );
  updatedConfig.ride.costInstallation.carousel = Number(
    document.getElementById("costInstallation-carousel").value
  );
  updatedConfig.ride.costInstallation["swing-claw"] = Number(
    document.getElementById("costInstallation-swing-claw").value
  );
  updatedConfig.ride.costInstallation["space-adventure"] = Number(
    document.getElementById("costInstallation-space-adventure").value
  );
  updatedConfig.ride.costInstallation.rollercoaster = Number(
    document.getElementById("costInstallation-rollercoaster").value
  );
  updatedConfig.ride.costInstallation.arcade = Number(
    document.getElementById("costInstallation-arcade").value
  );

  // ticket price
  updatedConfig.ride.ticketPrice["circus-tent"] = Number(
    document.getElementById("ticketPrice-circus-tent").value
  );
  updatedConfig.ride.ticketPrice["water-ride"] = Number(
    document.getElementById("ticketPrice-water-ride").value
  );
  updatedConfig.ride.ticketPrice["bumper-car"] = Number(
    document.getElementById("ticketPrice-bumper-car").value
  );
  updatedConfig.ride.ticketPrice["ferris-wheel"] = Number(
    document.getElementById("ticketPrice-ferris-wheel").value
  );
  updatedConfig.ride.ticketPrice.roundabout = Number(
    document.getElementById("ticketPrice-roundabout").value
  );
  updatedConfig.ride.ticketPrice.carousel = Number(
    document.getElementById("ticketPrice-carousel").value
  );
  updatedConfig.ride.ticketPrice["swing-claw"] = Number(
    document.getElementById("ticketPrice-swing-claw").value
  );
  updatedConfig.ride.ticketPrice["space-adventure"] = Number(
    document.getElementById("ticketPrice-space-adventure").value
  );
  updatedConfig.ride.ticketPrice.rollercoaster = Number(
    document.getElementById("ticketPrice-rollercoaster").value
  );
  updatedConfig.ride.ticketPrice.arcade = Number(
    document.getElementById("ticketPrice-arcade").value
  );

  // ride duration
  updatedConfig.ride.rideDuration["circus-tent"] = Number(
    document.getElementById("rideDuration-circus-tent").value
  );
  updatedConfig.ride.rideDuration["water-ride"] = Number(
    document.getElementById("rideDuration-water-ride").value
  );
  updatedConfig.ride.rideDuration["bumper-car"] = Number(
    document.getElementById("rideDuration-bumper-car").value
  );
  updatedConfig.ride.rideDuration["ferris-wheel"] = Number(
    document.getElementById("rideDuration-ferris-wheel").value
  );
  updatedConfig.ride.rideDuration.roundabout = Number(
    document.getElementById("rideDuration-roundabout").value
  );
  updatedConfig.ride.rideDuration.carousel = Number(
    document.getElementById("rideDuration-carousel").value
  );
  updatedConfig.ride.rideDuration["swing-claw"] = Number(
    document.getElementById("rideDuration-swing-claw").value
  );
  updatedConfig.ride.rideDuration["space-adventure"] = Number(
    document.getElementById("rideDuration-space-adventure").value
  );
  updatedConfig.ride.rideDuration.rollercoaster = Number(
    document.getElementById("rideDuration-rollercoaster").value
  );
  updatedConfig.ride.rideDuration.arcade = Number(
    document.getElementById("rideDuration-arcade").value
  );

  // ride capacity
  updatedConfig.ride.rideCapacity["circus-tent"] = Number(
    document.getElementById("rideCapacity-circus-tent").value
  );
  updatedConfig.ride.rideCapacity["water-ride"] = Number(
    document.getElementById("rideCapacity-water-ride").value
  );
  updatedConfig.ride.rideCapacity["bumper-car"] = Number(
    document.getElementById("rideCapacity-bumper-car").value
  );
  updatedConfig.ride.rideCapacity["ferris-wheel"] = Number(
    document.getElementById("rideCapacity-ferris-wheel").value
  );
  updatedConfig.ride.rideCapacity.roundabout = Number(
    document.getElementById("rideCapacity-roundabout").value
  );
  updatedConfig.ride.rideCapacity.carousel = Number(
    document.getElementById("rideCapacity-carousel").value
  );
  updatedConfig.ride.rideCapacity["swing-claw"] = Number(
    document.getElementById("rideCapacity-swing-claw").value
  );
  updatedConfig.ride.rideCapacity["space-adventure"] = Number(
    document.getElementById("rideCapacity-space-adventure").value
  );
  updatedConfig.ride.rideCapacity.rollercoaster = Number(
    document.getElementById("rideCapacity-rollercoaster").value
  );
  updatedConfig.ride.rideCapacity.arcade = Number(
    document.getElementById("rideCapacity-arcade").value
  );

  // operational cost
  updatedConfig.ride.operationalCost["circus-tent"] = Number(
    document.getElementById("operationalCost-circus-tent").value
  );
  updatedConfig.ride.operationalCost["water-ride"] = Number(
    document.getElementById("operationalCost-water-ride").value
  );
  updatedConfig.ride.operationalCost["bumper-car"] = Number(
    document.getElementById("operationalCost-bumper-car").value
  );
  updatedConfig.ride.operationalCost["ferris-wheel"] = Number(
    document.getElementById("operationalCost-ferris-wheel").value
  );
  updatedConfig.ride.operationalCost.roundabout = Number(
    document.getElementById("operationalCost-roundabout").value
  );
  updatedConfig.ride.operationalCost.carousel = Number(
    document.getElementById("operationalCost-carousel").value
  );
  updatedConfig.ride.operationalCost["swing-claw"] = Number(
    document.getElementById("operationalCost-swing-claw").value
  );
  updatedConfig.ride.operationalCost["space-adventure"] = Number(
    document.getElementById("operationalCost-space-adventure").value
  );
  updatedConfig.ride.operationalCost.rollercoaster = Number(
    document.getElementById("operationalCost-rollercoaster").value
  );
  updatedConfig.ride.operationalCost.arcade = Number(
    document.getElementById("operationalCost-arcade").value
  );

  // stand setting
  // cost installation
  updatedConfig.stand.costInstallation["hot-dog"] = Number(
    document.getElementById("costInstallation-hot-dog").value
  );
  updatedConfig.stand.costInstallation.burger = Number(
    document.getElementById("costInstallation-burger").value
  );
  updatedConfig.stand.costInstallation.cafe = Number(
    document.getElementById("costInstallation-cafe").value
  );
  updatedConfig.stand.costInstallation["chinese-restaurant"] = Number(
    document.getElementById("costInstallation-chinese-restaurant").value
  );
  updatedConfig.stand.costInstallation["ice-cream"] = Number(
    document.getElementById("costInstallation-ice-cream").value
  );

  // operational cost
  updatedConfig.stand.operationalCost["hot-dog"] = Number(
    document.getElementById("operationalCost-hot-dog").value
  );
  updatedConfig.stand.operationalCost.burger = Number(
    document.getElementById("operationalCost-burger").value
  );
  updatedConfig.stand.operationalCost.cafe = Number(
    document.getElementById("operationalCost-cafe").value
  );
  updatedConfig.stand.operationalCost["chinese-restaurant"] = Number(
    document.getElementById("operationalCost-chinese-restaurant").value
  );
  updatedConfig.stand.operationalCost["ice-cream"] = Number(
    document.getElementById("operationalCost-ice-cream").value
  );

  // purchase opportunity
  updatedConfig.stand.purchaseOpportunity["hot-dog"] = Number(
    document.getElementById("purchaseOpportunity-hot-dog").value
  );
  updatedConfig.stand.purchaseOpportunity.burger = Number(
    document.getElementById("purchaseOpportunity-burger").value
  );
  updatedConfig.stand.purchaseOpportunity.cafe = Number(
    document.getElementById("purchaseOpportunity-cafe").value
  );
  updatedConfig.stand.purchaseOpportunity["chinese-restaurant"] = Number(
    document.getElementById("purchaseOpportunity-chinese-restaurant").value
  );
  updatedConfig.stand.purchaseOpportunity["ice-cream"] = Number(
    document.getElementById("purchaseOpportunity-ice-cream").value
  );

  // arpcMean
  updatedConfig.stand.arpcMean["hot-dog"] = Number(
    document.getElementById("arpcMean-hot-dog").value
  );
  updatedConfig.stand.arpcMean.burger = Number(
    document.getElementById("arpcMean-burger").value
  );
  updatedConfig.stand.arpcMean.cafe = Number(
    document.getElementById("arpcMean-cafe").value
  );
  updatedConfig.stand.arpcMean["chinese-restaurant"] = Number(
    document.getElementById("arpcMean-chinese-restaurant").value
  );
  updatedConfig.stand.arpcMean["ice-cream"] = Number(
    document.getElementById("arpcMean-ice-cream").value
  );

  //arpcSd
  updatedConfig.stand.arpcSd["hot-dog"] = Number(
    document.getElementById("arpcSd-hot-dog").value
  );
  updatedConfig.stand.arpcSd.burger = Number(
    document.getElementById("arpcSd-burger").value
  );
  updatedConfig.stand.arpcSd.cafe = Number(
    document.getElementById("arpcSd-cafe").value
  );
  updatedConfig.stand.arpcSd["chinese-restaurant"] = Number(
    document.getElementById("arpcSd-chinese-restaurant").value
  );
  updatedConfig.stand.arpcSd["ice-cream"] = Number(
    document.getElementById("arpcSd-ice-cream").value
  );

  // timeToSpendMean
  updatedConfig.stand.timeToSpendMean["hot-dog"] = Number(
    document.getElementById("timeToSpendMean-hot-dog").value
  );
  updatedConfig.stand.timeToSpendMean.burger = Number(
    document.getElementById("timeToSpendMean-burger").value
  );
  updatedConfig.stand.timeToSpendMean.cafe = Number(
    document.getElementById("timeToSpendMean-cafe").value
  );
  updatedConfig.stand.timeToSpendMean["chinese-restaurant"] = Number(
    document.getElementById("timeToSpendMean-chinese-restaurant").value
  );
  updatedConfig.stand.timeToSpendMean["ice-cream"] = Number(
    document.getElementById("timeToSpendMean-ice-cream").value
  );

  // timeToSpendSd
  updatedConfig.stand.timeToSpendSd["hot-dog"] = Number(
    document.getElementById("timeToSpendSd-hot-dog").value
  );
  updatedConfig.stand.timeToSpendSd.burger = Number(
    document.getElementById("timeToSpendSd-burger").value
  );
  updatedConfig.stand.timeToSpendSd.cafe = Number(
    document.getElementById("timeToSpendSd-cafe").value
  );
  updatedConfig.stand.timeToSpendSd["chinese-restaurant"] = Number(
    document.getElementById("timeToSpendSd-chinese-restaurant").value
  );
  updatedConfig.stand.timeToSpendSd["ice-cream"] = Number(
    document.getElementById("timeToSpendSd-ice-cream").value
  );

  return updatedConfig;
}

export { defaultConfig, updateConfig };
