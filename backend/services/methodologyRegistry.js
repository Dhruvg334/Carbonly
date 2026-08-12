/**
 * Carbonly Methodology Registry (MR)
 * Manages versioned, audited GHG Protocol accounting methodologies, operational control boundaries, and assumptions.
 */

const METHODOLOGY_REGISTRY = {
    "S1-MC-01": {
        methodology_id: "S1-MC-01",
        name: "Direct Fleet Mobile Combustion (Fuel-Distance Method)",
        scope: "Scope 1",
        ghg_category: "Mobile Combustion",
        accounting_boundary: "Operational Control Fleet Boundary",
        calculation_method: "Distance (km) x Fuel Specific Factor (kgCO2e/km)",
        included_emissions: ["CO2", "CH4", "N2O"],
        excluded_emissions: ["Biogenic CO2"],
        assumptions: "Assumes standard corporate passenger vehicle efficiency under average driving conditions.",
        version: "1.2",
        effective_from: "2024-01-01",
        effective_to: "2024-12-31"
    },
    "S2-LOC-01": {
        methodology_id: "S2-LOC-01",
        name: "Location-Based Electricity Grid Draw",
        scope: "Scope 2",
        ghg_category: "Purchased Electricity (Location-Based)",
        accounting_boundary: "Facility Physical Consumption Meter",
        calculation_method: "Consumption (kWh) x Regional Subgrid Average Factor (kgCO2e/kWh)",
        included_emissions: ["CO2", "CH4", "N2O"],
        assumptions: "Location-based subregion grid average carbon intensity factors applied per US EPA eGRID / UK DEFRA.",
        version: "2.0",
        effective_from: "2023-01-01",
        effective_to: "2024-12-31"
    },
    "S2-MKT-01": {
        methodology_id: "S2-MKT-01",
        name: "Market-Based Electricity Contractual Instrument Method",
        scope: "Scope 2",
        ghg_category: "Purchased Electricity (Market-Based)",
        accounting_boundary: "Contractual Instrument PPA / REC / Guarantee of Origin Claim",
        calculation_method: "[Consumption (kWh) - Contracted PPA (kWh)] x Grid Factor + [PPA (kWh) x Residual Factor]",
        included_emissions: ["CO2"],
        assumptions: "Requires active contractual instruments matching claim period and regional market boundaries.",
        version: "1.1",
        effective_from: "2024-01-01",
        effective_to: "2024-12-31"
    },
    "S3-CAT6-01": {
        methodology_id: "S3-CAT6-01",
        name: "Business Aviation Passenger Travel",
        scope: "Scope 3",
        ghg_category: "Category 6: Business Travel",
        accounting_boundary: "Commercial Airline Passenger Mileage",
        calculation_method: "Passenger-km x Baseline Factor x IPCC AR6 1.9x Radiative Forcing Multiplier",
        included_emissions: ["CO2", "CH4", "N2O", "High-Altitude Contrails & NOx"],
        assumptions: "1.9x Radiative Forcing multiplier applied to baseline passenger-km factor excluding double counting.",
        version: "1.0",
        effective_from: "2024-01-01",
        effective_to: "2024-12-31"
    },
    "S3-CAT4-01": {
        methodology_id: "S3-CAT4-01",
        name: "Operational Water Supply & Treatment",
        scope: "Scope 3",
        ghg_category: "Category 4/5: Operational Waste & Water Supply",
        accounting_boundary: "Facility Municipal Water Inflow Volume",
        calculation_method: "Volume (Liters) x Municipal Treatment Factor (0.000708 kgCO2e/L)",
        included_emissions: ["CO2"],
        assumptions: "Covers public utility water supply and wastewater treatment lifecycle carbon draw.",
        version: "1.0",
        effective_from: "2024-01-01",
        effective_to: "2024-12-31"
    },
    "S3-CAT3-01": {
        methodology_id: "S3-CAT3-01",
        name: "Digital Infrastructure Activity Estimate Model",
        scope: "Scope 3",
        ghg_category: "Category 3: Fuel & Energy-Related Digital Activities (Estimate)",
        accounting_boundary: "Cloud Data Center Data Transfer & Display Runtime",
        calculation_method: "(Data GB x 0.06 + Display Hrs x 0.03) x Regional Grid Intensity Factor",
        included_emissions: ["CO2"],
        assumptions: "Estimate model for digital cloud transmission energy; clearly distinguished from primary utility metrics.",
        version: "1.0",
        effective_from: "2024-01-01",
        effective_to: "2024-12-31"
    }
};

function getMethodology(methodologyId) {
    const method = METHODOLOGY_REGISTRY[methodologyId];
    if (!method) {
        throw new Error(`Methodology ID '${methodologyId}' not found in Registry.`);
    }
    return { ...method };
}

module.exports = {
    METHODOLOGY_REGISTRY,
    getMethodology
};
