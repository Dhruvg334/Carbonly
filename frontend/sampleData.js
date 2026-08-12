/**
 * Pre-Loaded Industry Sample Profiles for Immediate Sandbox Testing
 * Allows recruiters, analysts, and users to test Scope 1, 2, 3 calculations with realistic datasets.
 */

const SAMPLE_PROFILES = {
    techOffice: {
        name: "Small Tech Office (Scope 2 Heavy)",
        badge: "Scope 2 Dominant",
        data: {
            transportKm: 120,
            vehicleType: "gasoline",
            electricityKwh: 1450,
            region: "US",
            flightsTaken: 1,
            flightType: "short",
            waterLiters: 1200,
            screenHours: 160,
            internetGb: 450
        }
    },
    logisticsFleet: {
        name: "Logistics & Sales Fleet (Scope 1 Heavy)",
        badge: "Scope 1 Dominant",
        data: {
            transportKm: 2800,
            vehicleType: "diesel",
            electricityKwh: 380,
            region: "US",
            flightsTaken: 0,
            flightType: "short",
            waterLiters: 800,
            screenHours: 40,
            internetGb: 120
        }
    },
    globalConsulting: {
        name: "Global Consulting Firm (Scope 3 Heavy)",
        badge: "Scope 3 Dominant",
        data: {
            transportKm: 300,
            vehicleType: "electric",
            electricityKwh: 520,
            region: "EU",
            flightsTaken: 6,
            flightType: "long",
            waterLiters: 2400,
            screenHours: 120,
            internetGb: 600
        }
    }
};

/**
 * Populates dashboard form inputs with selected sample dataset.
 */
function loadSampleProfile(profileKey) {
    const profile = SAMPLE_PROFILES[profileKey];
    if (!profile || !profile.data) return;

    const data = profile.data;
    document.getElementById("transportKm").value = data.transportKm;
    document.getElementById("vehicleType").value = data.vehicleType;
    document.getElementById("electricityKwh").value = data.electricityKwh;
    document.getElementById("region").value = data.region;
    document.getElementById("flightsTaken").value = data.flightsTaken;
    document.getElementById("flightType").value = data.flightType;
    document.getElementById("waterLiters").value = data.waterLiters;
    document.getElementById("screenHours").value = data.screenHours;
    document.getElementById("internetGb").value = data.internetGb;

    // Trigger calculation automatically
    if (typeof calculateAndAnalyze === "function") {
        calculateAndAnalyze();
    }
}
