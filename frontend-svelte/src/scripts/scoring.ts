import * as turf from '@turf/turf';

// TODO: tweak scoring consts
// distances in meters
const earthRadius = 6371009;
const earthArea = 510066000000000
const earthSqrt = 22584640;
const maxScore = 5000;
// score is divided by decayBase every halfDistance meters (if area=earthArea)
const decayBase = 2;
const halfDistance = 1000000;

// [score, distance] given location of guess and pano, graceDistance, and Polygon area
function calcScoreDistance(guess, actual, graceDistance=0, area=earthArea) {
    // TODO: cleaner handling of maps with no Polygon (maybe give maps area earthArea on creation?)
    if (area == 0) {
        area = earthArea;
    }
    // consider the guess invalid and return a score of zero
    if (Math.abs(guess.Location.Lat) > 90) {
        return [0, 0]
    }
    let guessPoint = turf.point([guess.Location.Lng, guess.Location.Lat]);
    let actualPoint =  turf.point([actual.Location.Lng, actual.Location.Lat]);
    let distance = turf.distance(guessPoint, actualPoint, {units: "kilometers"}) * 1000.0;
    if (distance < graceDistance) {
        return [maxScore, distance];
    }
    let relativeArea = Math.sqrt(area) / earthSqrt;
    let factor = Math.pow(decayBase, -1 * (distance - graceDistance) / (halfDistance * relativeArea));
    return [Math.round(factor * maxScore), distance];
}

// totalScore given _ordered_ arrays of {Lat, Lng}.
// actuals must be at least as long as guesses
function calcTotalScore(guesses, actuals, graceDistance=0, area=earthArea) {
    let totalScore = 0;
    let currentScore;
    guesses.forEach((guess, i) => {
        currentScore = calcScoreDistance(guess, actuals[i], graceDistance, area)[0];
        totalScore += currentScore;
    });
    return totalScore;
}

// returns a prettified distance given float meters
function distString(meters) {
    if (meters < 1000) {
        return (meters).toFixed(1) + " m";
    }
    return (meters / 1000).toFixed(1) + " km";
}

export { calcScoreDistance, calcTotalScore, distString };