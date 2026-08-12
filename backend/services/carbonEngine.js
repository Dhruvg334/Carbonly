/**
 * Deterministic Carbon Emissions Calculation Engine
 * Compliant with GHG Protocol Corporate Standard, DEFRA, and EPA emission factor guidelines.
 */

// Emission factor database (kg CO2e per unit)
const EMISSION_FACTORS = {
    transport: {
        gasoline: 0.192, // kg CO2e / km
        diesel: 0.171,   // kg CO2e / km
        electric: 0.053, // kg CO2e / km (grid average)
        default: 0.175   // kg CO2e / km (mixed average)
    },
    electricityGrid: {
        US: 0.385,     // kg CO2e / kWh
        EU: 0.255,     // kg CO2e / kWh
        IN: 0.710,     // kg CO2e / kWh
        GLOBAL: 0.475  // kg CO2e / kWh (global default)
    },
    flights: {
        shortHaulKmAvg: 800,   // km per flight
        longHaulKmAvg: 3500,   // km per flight
        shortHaulFactor: 0.156, // kg CO2e / passenger-km
        longHaulFactor: 0.115,  // kg CO2e / passenger-km
        radiativeForcingMultiplier: 1.9 // High altitude forcing factor
    },
    water: {
        kgPerLiter: 0.000708,  // Supply + wastewater treatment intensity
        kgPerCubicMeter: 0.708 // kg CO2e / m^3
    },
    digital: {
        kwhPerGB: 0.06,       // kWh per GB data transfer
        kwhPerScreenHour: 0.03 // kWh per hour of screen/device usage
    }
};

/**
 * Calculates GHG emissions across Scope 1, Scope 2, and Scope 3
 * 
 * @param {Object} activityData User lifestyle or operational metrics
 * @param {number} [activityData.transportKm=0] Vehicle distance traveled in km
 * @param {string} [activityData.vehicleType='default'] Gasoline, diesel, electric, or default
 * @param {number} [activityData.electricityKwh=0] Electricity consumption in kWh
 * @param {string} [activityData.region='GLOBAL'] US, EU, IN, or GLOBAL grid intensity
 * @param {number} [activityData.flightsTaken=0] Total flight count
 * @param {string} [activityData.flightType='short'] Short-haul or long-haul
 * @param {number} [activityData.waterLiters=0] Water consumption in Liters
 * @param {number} [activityData.screenHours=0] Screen time usage in hours
 * @param {number} [activityData.internetGb=0] Data transfer in GB
 * 
 * @returns {Object} Granular emissions metrics in kg CO2e and metric tons (tCO2e)
 */
function calculateEmissions(activityData = {}) {
    const transportKm = Math.max(0, Number(activityData.transportKm || activityData.transport_km || 0));
    const vehicleType = (activityData.vehicleType || 'default').toLowerCase();
    
    const electricityKwh = Math.max(0, Number(activityData.electricityKwh || activityData.electricity_consumption || activityData.energy_kwh || 0));
    const region = (activityData.region || 'GLOBAL').toUpperCase();

    const flightsTaken = Math.max(0, Number(activityData.flightsTaken || activityData.flights_taken || 0));
    const flightType = (activityData.flightType || 'short').toLowerCase();

    // Map legacy qualitative water inputs if present
    let waterLiters = 0;
    if (typeof activityData.waterLiters === 'number') {
        waterLiters = Math.max(0, activityData.waterLiters);
    } else if (typeof activityData.water_usage === 'number') {
        waterLiters = activityData.water_usage * 150; // Map level factor to estimated daily liters
    }

    const screenHours = Math.max(0, Number(activityData.screenHours || activityData.screen || 0));
    const internetGb = Math.max(0, Number(activityData.internetGb || activityData.internet || 0));

    // Scope 1: Direct emissions (Personal / fleet vehicle transport)
    const transportFactor = EMISSION_FACTORS.transport[vehicleType] || EMISSION_FACTORS.transport.default;
    const scope1Kg = transportKm * transportFactor;

    // Scope 2: Indirect electricity emissions
    const gridFactor = EMISSION_FACTORS.electricityGrid[region] || EMISSION_FACTORS.electricityGrid.GLOBAL;
    const scope2Kg = electricityKwh * gridFactor;

    // Scope 3: Value chain & indirect emissions
    // Flight emissions
    const flightDistAvg = flightType === 'long' ? EMISSION_FACTORS.flights.longHaulKmAvg : EMISSION_FACTORS.flights.shortHaulKmAvg;
    const flightFactor = flightType === 'long' ? EMISSION_FACTORS.flights.longHaulFactor : EMISSION_FACTORS.flights.shortHaulFactor;
    const flightsKg = flightsTaken * flightDistAvg * flightFactor * EMISSION_FACTORS.flights.radiativeForcingMultiplier;

    // Water lifecycle emissions
    const waterKg = waterLiters * EMISSION_FACTORS.water.kgPerLiter;

    // Digital footprint emissions (converted via electricity grid factor)
    const digitalKwh = (internetGb * EMISSION_FACTORS.digital.kwhPerGB) + (screenHours * EMISSION_FACTORS.digital.kwhPerScreenHour);
    const digitalKg = digitalKwh * gridFactor;

    const scope3Kg = flightsKg + waterKg + digitalKg;

    // Total emissions
    const totalKg = scope1Kg + scope2Kg + scope3Kg;
    const totalTonnes = totalKg / 1000;

    // Calculate percentage breakdown safely
    const getPercentage = (val) => (totalKg > 0 ? Number(((val / totalKg) * 100).toFixed(1)) : 0);

    return {
        totalKg: Number(totalKg.toFixed(3)),
        totalTonnes: Number(totalTonnes.toFixed(5)),
        scopes: {
            scope1: {
                kg: Number(scope1Kg.toFixed(3)),
                percentage: getPercentage(scope1Kg),
                category: "Direct Fleet & Vehicle Transport"
            },
            scope2: {
                kg: Number(scope2Kg.toFixed(3)),
                percentage: getPercentage(scope2Kg),
                category: "Purchased Electricity"
            },
            scope3: {
                kg: Number(scope3Kg.toFixed(3)),
                percentage: getPercentage(scope3Kg),
                categories: {
                    flights: Number(flightsKg.toFixed(3)),
                    water: Number(waterKg.toFixed(3)),
                    digital: Number(digitalKg.toFixed(3))
                }
            }
        },
        breakdown: {
            transportKg: Number(scope1Kg.toFixed(3)),
            electricityKg: Number(scope2Kg.toFixed(3)),
            flightsKg: Number(flightsKg.toFixed(3)),
            waterKg: Number(waterKg.toFixed(3)),
            digitalKg: Number(digitalKg.toFixed(3))
        },
        metadata: {
            gridFactorUsed: gridFactor,
            transportFactorUsed: transportFactor,
            calculatedAt: new Date().toISOString()
        }
    };
}

module.exports = {
    calculateEmissions,
    EMISSION_FACTORS
};
