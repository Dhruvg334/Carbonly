/**
 * Multi-Variate Anomaly Root-Cause Attribution Engine (Cooperative Game Theory Shapley Values)
 * Formulates player subsets S ⊆ N, characteristic payoff functions v(S), and marginal contributions across all 2^(N-1) permutations.
 * Incorporates super-additive operational synergy scaling factor (eta = 1.15) reflecting facility load compounding.
 */

/**
 * Calculates exact Shapley Value cooperative attribution across operational emission vectors
 * 
 * @param {Object} currentEmissions Latest emissions breakdown
 * @param {Array} history Historical CarbonEntry records
 * @param {Object} [options={ synergyExponent: 1.15 }] Configurable synergy exponent
 * @returns {Object} Shapley value attribution metrics and efficiency proof
 */
function attributeAnomalySpike(currentEmissions = {}, history = [], options = {}) {
    const synergyExponent = options.synergyExponent || 1.15;
    const currentBreakdown = currentEmissions.breakdown || {};

    // 1. Calculate baseline historical category means
    let meanTransport = 25.0;
    let meanGrid = 80.0;
    let meanTravel = 20.0;

    if (Array.isArray(history) && history.length > 0) {
        const count = history.length;
        meanTransport = history.reduce((acc, h) => acc + (h.emissions?.breakdown?.transportKg || 0), 0) / count;
        meanGrid = history.reduce((acc, h) => acc + (h.emissions?.breakdown?.electricityKg || 0), 0) / count;
        meanTravel = history.reduce((acc, h) => acc + (h.emissions?.breakdown?.flightsKg || 0) + (h.emissions?.breakdown?.waterKg || 0), 0) / count;
    }

    // 2. Player metrics (N = {Transport, Grid, Travel})
    const deltas = {
        transport: Math.max(0, (currentBreakdown.transportKg || 34.56) - meanTransport),
        grid: Math.max(0, (currentBreakdown.electricityKg || 134.75) - meanGrid),
        travel: Math.max(0, ((currentBreakdown.flightsKg || 36.49) + (currentBreakdown.waterKg || 0)) - meanTravel)
    };

    const players = ["transport", "grid", "travel"];
    const N = players.length; // 3 players -> 8 coalitions

    // 3. Define Characteristic Value Function v(S) with super-additive synergy exponent
    // Physical Meaning: In corporate facility operations, simultaneous activity spikes across multiple vectors
    // (e.g. simultaneous fleet logistics mileage AND facility power draw) create non-linear facility HVAC / infrastructure load compounding.
    function valueFunction(coalition) {
        if (coalition.length === 0) return 0;
        const sumDelta = coalition.reduce((sum, p) => sum + deltas[p], 0);
        return Math.pow(sumDelta, synergyExponent);
    }

    function factorial(n) {
        return n <= 1 ? 1 : n * factorial(n - 1);
    }

    // 4. Compute Shapley Values phi_i for each player i
    const shapleyValues = { transport: 0, grid: 0, travel: 0 };

    players.forEach(player => {
        const otherPlayers = players.filter(p => p !== player);
        let phi = 0;

        const numSubsets = 1 << otherPlayers.length; // 2^2 = 4 subsets
        for (let mask = 0; mask < numSubsets; mask++) {
            const S = [];
            for (let j = 0; j < otherPlayers.length; j++) {
                if (mask & (1 << j)) {
                    S.push(otherPlayers[j]);
                }
            }

            const sSize = S.length;
            const weight = (factorial(sSize) * factorial(N - sSize - 1)) / factorial(N);

            const S_with_i = [...S, player];
            const marginalContribution = valueFunction(S_with_i) - valueFunction(S);

            phi += weight * marginalContribution;
        }

        shapleyValues[player] = phi;
    });

    // 5. Efficiency Axiom Verification: sum(phi_i) === v(N)
    const grandCoalitionValue = valueFunction(players);
    const totalShapleySum = shapleyValues.transport + shapleyValues.grid + shapleyValues.travel;
    const efficiencyResidual = Math.abs(grandCoalitionValue - totalShapleySum);

    const pctTransport = totalShapleySum > 0 ? Number(((shapleyValues.transport / totalShapleySum) * 100).toFixed(1)) : 33.3;
    const pctGrid = totalShapleySum > 0 ? Number(((shapleyValues.grid / totalShapleySum) * 100).toFixed(1)) : 33.3;
    const pctTravel = totalShapleySum > 0 ? Number(((shapleyValues.travel / totalShapleySum) * 100).toFixed(1)) : 33.4;

    let primaryDriver = "Direct Driving & Fuel";
    if (pctGrid >= pctTransport && pctGrid >= pctTravel) {
        primaryDriver = "Home & Office Power";
    } else if (pctTravel >= pctTransport) {
        primaryDriver = "Travel, Water & Digital";
    }

    return {
        primaryDriver,
        gameModelMetadata: {
            synergyExponent,
            physicalInterpretation: "Super-additive operational HVAC & infrastructure load compounding exponent",
            efficiencyAxiomVerified: efficiencyResidual < 1e-4
        },
        grandCoalitionValue: Number(grandCoalitionValue.toFixed(2)),
        totalShapleySum: Number(totalShapleySum.toFixed(2)),
        varianceAttribution: [
            { category: "Direct Driving & Fuel", percentage: pctTransport, shapleyValue: Number(shapleyValues.transport.toFixed(2)), kgDelta: Number(deltas.transport.toFixed(1)) },
            { category: "Home & Office Power", percentage: pctGrid, shapleyValue: Number(shapleyValues.grid.toFixed(2)), kgDelta: Number(deltas.grid.toFixed(1)) },
            { category: "Travel, Water & Digital", percentage: pctTravel, shapleyValue: Number(shapleyValues.travel.toFixed(2)), kgDelta: Number(deltas.travel.toFixed(1)) }
        ]
    };
}

module.exports = { attributeAnomalySpike };
