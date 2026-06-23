// Constants - Direct port from plinko-game-main/src/lib/constants/game.ts

export const DEFAULT_BALANCE = 200;

export const ROW_COUNT_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export const AUTO_BET_INTERVAL_MS = 250;

// Multipliers of each bin by row count and risk level
export const BIN_PAYOUTS = {
    8: {
        low: [5.43, 2.04, 1.07, 0.97, 0.49, 0.97, 1.07, 2.04, 5.43],
        medium: [12.61, 2.91, 1.26, 0.68, 0.39, 0.68, 1.26, 2.91, 12.61],
        high: [28.13, 3.88, 1.46, 0.29, 0.19, 0.29, 1.46, 3.88, 28.13],
    },
    9: {
        low: [5.43, 1.94, 1.55, 0.97, 0.68, 0.68, 0.97, 1.55, 1.94, 5.43],
        medium: [17.46, 3.88, 1.65, 0.87, 0.49, 0.49, 0.87, 1.65, 3.88, 17.46],
        high: [41.71, 6.79, 1.94, 0.58, 0.19, 0.19, 0.58, 1.94, 6.79, 41.71],
    },
    10: {
        low: [8.63, 2.91, 1.36, 1.07, 0.97, 0.49, 0.97, 1.07, 1.36, 2.91, 8.63],
        medium: [21.34, 4.85, 1.94, 1.36, 0.58, 0.39, 0.58, 1.36, 1.94, 4.85, 21.34],
        high: [73.72, 9.70, 2.91, 0.87, 0.29, 0.19, 0.29, 0.87, 2.91, 9.70, 73.72],
    },
    11: {
        low: [8.15, 2.91, 1.84, 1.26, 0.97, 0.68, 0.68, 0.97, 1.26, 1.84, 2.91, 8.15],
        medium: [23.28, 5.82, 2.91, 1.75, 0.68, 0.49, 0.49, 0.68, 1.75, 2.91, 5.82, 23.28],
        high: [116.40, 13.58, 5.04, 1.36, 0.39, 0.19, 0.19, 0.39, 1.36, 5.04, 13.58, 116.40],
    },
    12: {
        low: [9.70, 2.91, 1.55, 1.36, 1.07, 0.97, 0.49, 0.97, 1.07, 1.36, 1.55, 2.91, 9.70],
        medium: [32.01, 10.67, 3.88, 1.94, 1.07, 0.58, 0.29, 0.58, 1.07, 1.94, 3.88, 10.67, 32.01],
        high: [164.90, 23.28, 7.86, 1.94, 0.68, 0.19, 0.19, 0.19, 0.68, 1.94, 7.86, 23.28, 164.90],
    },
    13: {
        low: [7.86, 3.88, 2.91, 1.84, 1.16, 0.87, 0.68, 0.68, 0.87, 1.16, 1.84, 2.91, 3.88, 7.86],
        medium: [41.71, 12.61, 5.82, 2.91, 1.26, 0.68, 0.39, 0.39, 0.68, 1.26, 2.91, 5.82, 12.61, 41.71],
        high: [252.20, 35.89, 10.67, 3.88, 0.97, 0.19, 0.19, 0.19, 0.19, 0.97, 3.88, 10.67, 35.89, 252.20],
    },
    14: {
        low: [6.89, 3.88, 1.84, 1.36, 1.26, 1.07, 0.97, 0.49, 0.97, 1.07, 1.26, 1.36, 1.84, 3.88, 6.89],
        medium: [56.26, 14.55, 6.79, 3.88, 1.84, 0.97, 0.49, 0.19, 0.49, 0.97, 1.84, 3.88, 6.79, 14.55, 56.26],
        high: [407.40, 54.32, 17.46, 4.85, 1.84, 0.29, 0.19, 0.19, 0.19, 0.29, 1.84, 4.85, 17.46, 54.32, 407.40],
    },
    15: {
        low: [14.55, 7.76, 2.91, 1.94, 1.46, 1.07, 0.97, 0.68, 0.68, 0.97, 1.07, 1.46, 1.94, 2.91, 7.76, 14.55],
        medium: [85.36, 17.46, 10.67, 4.85, 2.91, 1.26, 0.49, 0.29, 0.29, 0.49, 1.26, 2.91, 4.85, 10.67, 17.46, 85.36],
        high: [601.40, 80.51, 26.19, 7.76, 2.91, 0.49, 0.19, 0.19, 0.19, 0.19, 0.49, 2.91, 7.76, 26.19, 80.51, 601.40],
    },
    16: {
        low: [15.52, 8.73, 1.94, 1.36, 1.36, 1.16, 1.07, 0.97, 0.49, 0.97, 1.07, 1.16, 1.36, 1.36, 1.94, 8.73, 15.52],
        medium: [106.70, 39.77, 9.70, 4.85, 2.91, 1.46, 0.97, 0.49, 0.29, 0.49, 0.97, 1.46, 2.91, 4.85, 9.70, 39.77, 106.70],
        high: [970, 126.10, 25.22, 8.73, 3.88, 1.94, 0.19, 0.19, 0.19, 0.19, 0.19, 1.94, 3.88, 8.73, 25.22, 126.10, 970],
    },
};

// Bin colors - port from colors.ts
export const BIN_COLOR = {
    background: {
        red: { r: 255, g: 0, b: 63 },
        yellow: { r: 255, g: 192, b: 0 },
    },
    shadow: {
        red: { r: 166, g: 0, b: 4 },
        yellow: { r: 171, g: 121, b: 0 },
    },
};

// Interpolate RGB colors
export function interpolateRgbColors(from, to, length) {
    return Array.from({ length }, (_, i) => ({
        r: Math.round(from.r + ((to.r - from.r) / (length - 1)) * i),
        g: Math.round(from.g + ((to.g - from.g) / (length - 1)) * i),
        b: Math.round(from.b + ((to.b - from.b) / (length - 1)) * i),
    }));
}

// Get bin colors for a row count
export function getBinColors(rowCount) {
    const binCount = rowCount + 1;
    const isBinsEven = binCount % 2 === 0;
    const redToYellowLength = Math.ceil(binCount / 2);

    const redToYellowBg = interpolateRgbColors(
        BIN_COLOR.background.red,
        BIN_COLOR.background.yellow,
        redToYellowLength
    ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

    const redToYellowShadow = interpolateRgbColors(
        BIN_COLOR.shadow.red,
        BIN_COLOR.shadow.yellow,
        redToYellowLength
    ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

    return {
        background: [...redToYellowBg, ...redToYellowBg.slice().reverse().slice(isBinsEven ? 0 : 1)],
        shadow: [...redToYellowShadow, ...redToYellowShadow.slice().reverse().slice(isBinsEven ? 0 : 1)],
    };
}

// Get random number between min and max
export function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}
