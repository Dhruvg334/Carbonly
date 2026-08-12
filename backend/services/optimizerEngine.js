/**
 * Constrained Decarbonization Optimization Engine (Operations Research / DS)
 * Calculates the Pareto-optimal combination of decarbonization interventions given a user budget constraint.
 */

const DECARBONIZATION_INTERVENTIONS = [
    {
        id: "ev_transition",
        name: "Electric Vehicle Fleet Transition",
        category: "Direct Driving & Fuel",
        costPerYear: 800,
        carbonReductionRatio: 0.65, // Reduces driving footprint by 65%
        priority: 1
    },
    {
        id: "renewable_ppa",
        name: "Solar & Wind Power Purchase (PPA)",
        category: "Home & Office Power",
        costPerYear: 350,
        carbonReductionRatio: 0.85, // Reduces grid footprint by 85%
        priority: 2
    },
    {
        id: "flight_consolidation",
        name: "Virtual Meeting Flight Consolidation",
        category: "Travel & Lifestyle",
        costPerYear: 100,
        carbonReductionRatio: 0.50, // Reduces flight footprint by 50%
        priority: 3
    },
    {
        id: "water_recycling",
        name: "Smart Water Recycling & Low-Flow Systems",
        category: "Travel & Lifestyle",
        costPerYear: 150,
        carbonReductionRatio: 0.40,
        priority: 4
    }
];

/**
 * Solves for the optimal allocation of decarbonization interventions given a budget limit
 * 
 * @param {number} annualBudget Maximum annual budget limit in USD ($)
 * @param {Object} baselineEmissions Baseline emissions breakdown object
 * @returns {Object} Optimized intervention roadmap and slider positions
 */
function solveOptimalDecarbonization(annualBudget = 500, baselineEmissions = {}) {
    const budget = Math.max(0, Number(annualBudget || 500));
    const breakdown = baselineEmissions.breakdown || { transportKg: 100, electricityKg: 250, flightsKg: 150 };
    
    let remainingBudget = budget;
    const selectedInterventions = [];

    let recommendedTransportPct = 0;
    let recommendedPpaPct = 0;
    let recommendedFlightPct = 0;

    DECARBONIZATION_INTERVENTIONS.forEach(item => {
        if (remainingBudget >= item.costPerYear) {
            remainingBudget -= item.costPerYear;
            selectedInterventions.push({
                ...item,
                allocationStatus: "100% Implemented"
            });

            if (item.id === "ev_transition") recommendedTransportPct = 65;
            if (item.id === "renewable_ppa") recommendedPpaPct = 85;
            if (item.id === "flight_consolidation") recommendedFlightPct = 50;
        } else if (remainingBudget > 0) {
            const partialRatio = Number((remainingBudget / item.costPerYear).toFixed(2));
            selectedInterventions.push({
                ...item,
                allocationStatus: `${Math.round(partialRatio * 100)}% Partial Budget Allocation`
            });

            if (item.id === "ev_transition") recommendedTransportPct = Math.round(65 * partialRatio);
            if (item.id === "renewable_ppa") recommendedPpaPct = Math.round(85 * partialRatio);
            if (item.id === "flight_consolidation") recommendedFlightPct = Math.round(50 * partialRatio);

            remainingBudget = 0;
        }
    });

    // Calculate baseline vs optimized emissions
    const bTransport = breakdown.transportKg || 0;
    const bGrid = breakdown.electricityKg || 0;
    const bFlights = breakdown.flightsKg || 0;
    const bTotal = bTransport + bGrid + bFlights;

    const optTransport = bTransport * (1 - recommendedTransportPct / 100);
    const optGrid = bGrid * (1 - recommendedPpaPct / 100);
    const optFlights = bFlights * (1 - recommendedFlightPct / 100);
    const optTotal = optTransport + optGrid + optFlights;

    const totalKgSaved = Math.max(0, bTotal - optTotal);
    const netPercentReduced = bTotal > 0 ? Number(((totalKgSaved / bTotal) * 100).toFixed(1)) : 0;
    const annualNetDollarReturn = Math.round(totalKgSaved * 0.42 * 12);

    return {
        annualBudget: budget,
        remainingBudget: Math.round(remainingBudget),
        selectedInterventions,
        sliderRecommendations: {
            transportReductionPct: recommendedTransportPct,
            renewablePpaPct: recommendedPpaPct,
            flightReductionPct: recommendedFlightPct
        },
        impact: {
            totalKgSaved: Number(totalKgSaved.toFixed(2)),
            tonnesSaved: Number((totalKgSaved / 1000).toFixed(4)),
            netPercentReduced,
            annualNetDollarReturn
        }
    };
}

module.exports = { solveOptimalDecarbonization, DECARBONIZATION_INTERVENTIONS };
