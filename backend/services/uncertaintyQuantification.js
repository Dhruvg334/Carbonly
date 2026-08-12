/**
 * 10,000-Iteration Monte Carlo Uncertainty Quantification Engine Service
 * Executes independent stochastic draws using Box-Muller Gaussian and true Log-Normal distributions.
 * Computes non-parametric 80% Central Predictive Interval [P10, P90] and 95% Central Predictive Interval [P2.5, P97.5].
 */

const { calculateEmissions } = require("./carbonEngine");

/**
 * Standard Box-Muller transform for generating independent N(0, 1) Gaussian random variate
 */
function randomGaussian() {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Log-Normal Random Variable Generator: X = exp(mu_ln + sigma_ln * Z)
 */
function randomLogNormal(meanValue, cv) {
    if (meanValue <= 0) return 0;
    const sigmaLnSq = Math.log(1 + cv * cv);
    const sigmaLn = Math.sqrt(sigmaLnSq);
    const muLn = Math.log(meanValue) - 0.5 * sigmaLnSq;
    const Z = randomGaussian();
    return Math.exp(muLn + sigmaLn * Z);
}

/**
 * Runs N=10,000 stochastic Monte Carlo simulation draws for carbon footprint uncertainty propagation
 */
function runMonteCarloSimulation(inputPayload = {}, iterations = 10000) {
    const N = Math.min(20000, Math.max(100, Number(iterations || 10000)));

    const baseTransport = Number(inputPayload.transportKm || 180);
    const basePower = Number(inputPayload.electricityKwh || 350);
    const baseFlights = Number(inputPayload.flightsTaken || 1);
    const baseWater = Number(inputPayload.waterLiters || 1200);
    const baseDigital = Number(inputPayload.internetGb || 450);

    const draws = [];

    // Coefficient of variation (CV) uncertainties
    const cvTransport = 0.05; // 5% measurement CV (Gaussian)
    const cvPower = 0.03;     // 3% utility meter CV (Gaussian)
    const cvFlights = 0.10;   // 10% aviation distance/RF CV (Log-Normal right-skewed)
    const cvWater = 0.08;     // 8% water lifecycle CV (Log-Normal right-skewed)

    for (let i = 0; i < N; i++) {
        // Independent Gaussian draws Z_0, Z_1 for measurement inputs
        const z0 = randomGaussian();
        const z1 = randomGaussian();

        const sampledTransport = Math.max(0, baseTransport * (1 + z0 * cvTransport));
        const sampledPower = Math.max(0, basePower * (1 + z1 * cvPower));

        // Independent Log-Normal draws for right-skewed emission factors
        const sampledFlights = randomLogNormal(baseFlights, cvFlights);
        const sampledWater = randomLogNormal(baseWater, cvWater);

        const simResult = calculateEmissions({
            transportKm: sampledTransport,
            vehicleType: inputPayload.vehicleType || "gasoline",
            electricityKwh: sampledPower,
            region: inputPayload.region || "US",
            flightsTaken: sampledFlights,
            flightType: inputPayload.flightType || "short",
            waterLiters: sampledWater,
            screenHours: inputPayload.screenHours || 160,
            internetGb: baseDigital
        });

        draws.push(simResult.totalKg);
    }

    draws.sort((a, b) => a - b);

    const mean = draws.reduce((sum, v) => sum + v, 0) / N;
    const stdDev = Math.sqrt(draws.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / N);

    const p2_5 = Number(draws[Math.floor(N * 0.025)].toFixed(2));
    const p10 = Number(draws[Math.floor(N * 0.10)].toFixed(2));
    const p50 = Number(draws[Math.floor(N * 0.50)].toFixed(2));
    const p90 = Number(draws[Math.floor(N * 0.90)].toFixed(2));
    const p97_5 = Number(draws[Math.floor(N * 0.975)].toFixed(2));

    return {
        simulationMetadata: {
            method: "10,000-Iteration Non-Parametric Monte Carlo Uncertainty Sampling",
            totalDraws: N,
            distributionType: "Independent Truncated Gaussian & True Log-Normal Sampling",
            independentVariablesEvaluated: 4
        },
        uncertaintyMetrics: {
            empiricalMeanKg: Number(mean.toFixed(2)),
            empiricalStdDevKg: Number(stdDev.toFixed(2)),
            p2_5_LowKg: p2_5,
            p10_OptimisticLowKg: p10,
            p50_MedianExpectedKg: p50,
            p90_ConservativeHighKg: p90,
            p97_5_HighKg: p97_5,
            interval80CentralPredictive: `[${p10} kg CO2e, ${p90} kg CO2e] (80% Central Interval)`,
            interval95CentralPredictive: `[${p2_5} kg CO2e, ${p97_5} kg CO2e] (95% Central Interval)`
        }
    };
}

module.exports = {
    runMonteCarloSimulation,
    randomGaussian,
    randomLogNormal
};
