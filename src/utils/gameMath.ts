import { City } from '../types/game';

/**
 * Calculates geodesic/pixel distance between two cities on the world map.
 * Returns approximate nautical miles (NM).
 */
export function calculateCityDistance(cityA: City, cityB: City): number {
  if (!cityA || !cityB) return 0;
  const dx = cityA.coords.x - cityB.coords.x;
  const dy = cityA.coords.y - cityB.coords.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 120);
}

/**
 * Calculates voyage duration in seconds based on distance, speed in knots, and game speed.
 */
export function calculateVoyageDuration(
  distanceNm: number,
  speedKnots: number,
  speedMultiplier: number = 1.0,
  gameSpeed: number = 1.0
): number {
  const effectiveSpeed = Math.max(10, speedKnots * speedMultiplier);
  const baseSeconds = Math.max(10, Math.round((distanceNm / effectiveSpeed) * 3.2));
  return Math.max(5, Math.round(baseSeconds / gameSpeed));
}

/**
 * Calculates fuel cost for a voyage based on distance, fuel rate, and discounts.
 */
export function calculateVoyageFuelCost(
  distanceNm: number,
  fuelPer1000Km: number,
  fuelDiscountMultiplier: number = 0
): number {
  const discount = Math.max(0, 1 - fuelDiscountMultiplier);
  return Math.round((distanceNm / 1000) * fuelPer1000Km * discount);
}
