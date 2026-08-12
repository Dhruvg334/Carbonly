/**
 * Carbonly Emission Factor Registry (EFR)
 * Manages versioned, immutable conversion factor records with full audit provenance.
 */

const EMISSION_FACTOR_REGISTRY = {
    // SCOPE 1: DIRECT FLEET TRANSPORT
    "DEFRA_TRANSPORT_GASOLINE_2024": {
        factor_id: "DEFRA_TRANSPORT_GASOLINE_2024",
        value: 0.192,
        unit: "kgCO2e/km",
        geography: "UK/Global",
        scope: "Scope 1",
        ghg_category: "Category 1: Direct Fleet Transport",
        source_organization: "UK DEFRA",
        source_document: "Government Conversion Factors for Company Reporting 2024",
        publication_year: 2024,
        version: "1.0",
        effective_from: "2024-01-01",
        effective_to: "2024-12-31",
        uncertainty_pct: 5.0,
        gas_coverage: ["CO2", "CH4", "N2O"]
    },
    "DEFRA_TRANSPORT_DIESEL_2024": {
        factor_id: "DEFRA_TRANSPORT_DIESEL_2024",
        value: 0.171,
        unit: "kgCO2e/km",
        geography: "UK/Global",
        scope: "Scope 1",
        ghg_category: "Category 1: Direct Fleet Transport",
        source_organization: "UK DEFRA",
        source_document: "Government Conversion Factors for Company Reporting 2024",
        publication_year: 2024,
        version: "1.0",
        effective_from: "2024-01-01",
        effective_to: "2024-12-31",
        uncertainty_pct: 5.0,
        gas_coverage: ["CO2", "CH4", "N2O"]
    },
    "DEFRA_TRANSPORT_EV_2024": {
        factor_id: "DEFRA_TRANSPORT_EV_2024",
        value: 0.053,
        unit: "kgCO2e/km",
        geography: "Global Grid Average",
        scope: "Scope 1/Indirect",
        ghg_category: "Category 1: Direct Fleet Transport (EV)",
        source_organization: "UK DEFRA / IEA",
        publication_year: 2024,
        version: "1.0",
        uncertainty_pct: 8.0,
        gas_coverage: ["CO2"]
    },

    // SCOPE 2: LOCATION-BASED & MARKET-BASED ELECTRICITY GRIDS
    "EPA_GRID_US_2023": {
        factor_id: "EPA_GRID_US_2023",
        value: 0.385,
        unit: "kgCO2e/kWh",
        geography: "US",
        scope: "Scope 2",
        ghg_category: "Purchased Electricity (Location-Based)",
        source_organization: "US EPA eGRID",
        source_document: "eGRID2023 Subregion Emission Factors",
        publication_year: 2023,
        version: "1.0",
        uncertainty_pct: 3.0,
        gas_coverage: ["CO2", "CH4", "N2O"]
    },
    "EU_GRID_AVERAGE_2024": {
        factor_id: "EU_GRID_AVERAGE_2024",
        value: 0.255,
        unit: "kgCO2e/kWh",
        geography: "EU",
        scope: "Scope 2",
        ghg_category: "Purchased Electricity (Location-Based)",
        source_organization: "European Environment Agency (EEA)",
        publication_year: 2024,
        version: "1.0",
        uncertainty_pct: 4.0,
        gas_coverage: ["CO2"]
    },
    "CEA_GRID_IN_2024": {
        factor_id: "CEA_GRID_IN_2024",
        value: 0.710,
        unit: "kgCO2e/kWh",
        geography: "IN",
        scope: "Scope 2",
        ghg_category: "Purchased Electricity (Location-Based)",
        source_organization: "Central Electricity Authority (CEA India)",
        publication_year: 2024,
        version: "1.0",
        uncertainty_pct: 5.0,
        gas_coverage: ["CO2"]
    },
    "GLOBAL_GRID_DEFAULT_2024": {
        factor_id: "GLOBAL_GRID_DEFAULT_2024",
        value: 0.475,
        unit: "kgCO2e/kWh",
        geography: "GLOBAL",
        scope: "Scope 2",
        ghg_category: "Purchased Electricity (Location-Based)",
        source_organization: "IEA Global Baseline",
        publication_year: 2024,
        version: "1.0",
        uncertainty_pct: 10.0,
        gas_coverage: ["CO2"]
    },

    // SCOPE 3: VALUE-CHAIN CATEGORIES (EXPLICIT GHG PROTOCOL MAPPINGS)
    "DEFRA_BUSINESS_TRAVEL_SHORT_2024": {
        factor_id: "DEFRA_BUSINESS_TRAVEL_SHORT_2024",
        value: 0.156,
        unit: "kgCO2e/passenger-km",
        geography: "Global Aviation",
        scope: "Scope 3",
        ghg_category: "Category 6: Business Travel",
        source_organization: "UK DEFRA / IPCC AR6",
        source_document: "DEFRA 2024 & IPCC AR6 Radiative Forcing Guidelines",
        publication_year: 2024,
        version: "1.0",
        radiative_forcing_multiplier: 1.9,
        uncertainty_pct: 10.0,
        gas_coverage: ["CO2", "CH4", "N2O", "Contrails"]
    },
    "DEFRA_BUSINESS_TRAVEL_LONG_2024": {
        factor_id: "DEFRA_BUSINESS_TRAVEL_LONG_2024",
        value: 0.115,
        unit: "kgCO2e/passenger-km",
        geography: "Global Aviation",
        scope: "Scope 3",
        ghg_category: "Category 6: Business Travel",
        source_organization: "UK DEFRA / IPCC AR6",
        publication_year: 2024,
        version: "1.0",
        radiative_forcing_multiplier: 1.9,
        uncertainty_pct: 10.0,
        gas_coverage: ["CO2", "CH4", "N2O", "Contrails"]
    },
    "DEFRA_WATER_SUPPLY_2024": {
        factor_id: "DEFRA_WATER_SUPPLY_2024",
        value: 0.000708,
        unit: "kgCO2e/Liter",
        geography: "UK/Global",
        scope: "Scope 3",
        ghg_category: "Category 4/5: Operational Waste & Water Supply",
        source_organization: "UK DEFRA",
        publication_year: 2024,
        version: "1.0",
        uncertainty_pct: 15.0,
        gas_coverage: ["CO2"]
    },
    "DIGITAL_ACTIVITY_ESTIMATE_2024": {
        factor_id: "DIGITAL_ACTIVITY_ESTIMATE_2024",
        value_per_gb: 0.06,
        value_per_hour: 0.03,
        unit: "kgCO2e/GB & hr",
        geography: "Global Cloud",
        scope: "Scope 3 Estimate",
        ghg_category: "Category 3: Fuel & Energy-Related Activities (Digital Activity Footprint)",
        source_organization: "IEA Digital Economy Taskforce",
        publication_year: 2024,
        version: "1.0",
        uncertainty_pct: 25.0,
        gas_coverage: ["CO2"]
    }
};

function getEmissionFactor(factorId) {
    const factor = EMISSION_FACTOR_REGISTRY[factorId];
    if (!factor) {
        throw new Error(`Emission Factor ID '${factorId}' not found in Registry.`);
    }
    return { ...factor };
}

function listRegistryFactors() {
    return Object.values(EMISSION_FACTOR_REGISTRY);
}

module.exports = {
    EMISSION_FACTOR_REGISTRY,
    getEmissionFactor,
    listRegistryFactors
};
