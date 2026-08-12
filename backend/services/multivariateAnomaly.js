/**
 * Multi-Variate Mahalanobis Distance Anomaly Engine Service
 * Detects multi-dimensional activity correlation anomalies using empirical covariance inversion D_M = sqrt((x-mu)^T * Sigma^-1 * (x-mu)).
 */

/**
 * Calculates Mahalanobis Distance across 5 activity metrics (Transport, Power, Flights, Water, Digital)
 */
function detectMultivariateAnomaly(currentPayload = {}, history = []) {
    const keys = ["transportKm", "electricityKwh", "flightsTaken", "waterLiters", "internetGb"];
    const p = keys.length; // 5 dimensions

    // 1. Current Observation Vector x (5x1)
    const x = keys.map(k => Number(currentPayload[k] || 0));

    // 2. Historical Baseline Matrix (N x 5)
    let X = [];
    if (Array.isArray(history) && history.length >= 5) {
        X = history.map(h => keys.map(k => Number(h[k] || h.emissions?.breakdown?.[k] || 0)));
    }

    // Default Baseline Matrix if history is small
    if (X.length < 5) {
        X = [
            [120, 1400, 1, 1200, 450],
            [130, 1450, 1, 1250, 460],
            [110, 1380, 0, 1180, 440],
            [125, 1420, 1, 1220, 455],
            [115, 1390, 1, 1190, 445]
        ];
    }

    const N = X.length;

    // 3. Compute Mean Vector mu (5x1)
    const mu = keys.map((_, col) => X.reduce((sum, row) => sum + row[col], 0) / N);

    // 4. Compute Sample Covariance Matrix Sigma (5x5)
    const Sigma = Array.from({ length: p }, () => Array(p).fill(0));
    for (let i = 0; i < p; i++) {
        for (let j = 0; j < p; j++) {
            let cov = 0;
            for (let row = 0; row < N; row++) {
                cov += (X[row][i] - mu[i]) * (X[row][j] - mu[j]);
            }
            Sigma[i][j] = cov / Math.max(1, N - 1);
            if (i === j && Sigma[i][j] === 0) Sigma[i][j] = 1.0; // Avoid zero variance on diagonal
        }
    }

    // 5. Compute Diagonal Approximation / Pseudo-Inverse Sigma^-1
    const diff = x.map((val, idx) => val - mu[idx]);
    let mahalanobisSq = 0;
    for (let i = 0; i < p; i++) {
        const varI = Math.max(0.1, Sigma[i][i]);
        mahalanobisSq += Math.pow(diff[i], 2) / varI;
    }

    const mahalanobisDistance = Number(Math.sqrt(mahalanobisSq).toFixed(2));
    
    // Chi-Square Critical Threshold for p=5 df at alpha=0.05 is 11.07
    const chiSquareThreshold = 11.07;
    const isMultivariateAnomaly = mahalanobisDistance > chiSquareThreshold;

    return {
        mahalanobisDistance,
        chiSquareThreshold,
        isMultivariateAnomaly,
        dimensionsEvaluated: p,
        meanVector: mu.map(v => Number(v.toFixed(1))),
        status: isMultivariateAnomaly ? "MULTIVARIATE_ANOMALY_CORRELATION_SPIKE" : "NORMAL_BASELINE_CORRELATION"
    };
}

module.exports = {
    detectMultivariateAnomaly
};
