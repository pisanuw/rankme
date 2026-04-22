/**
 * ELO rating system with K-factor that decreases as a player gains experience.
 * New items (< 10 games): K=40 (changes rapidly)
 * Developing items (10–29 games): K=20
 * Established items (30+ games): K=10
 */

function getKFactor(gamesPlayed: number): number {
  if (gamesPlayed < 10) return 40;
  if (gamesPlayed < 30) return 20;
  return 10;
}

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export interface EloResult {
  newEloA: number;
  newEloB: number;
}

/**
 * Calculate new ELO ratings after a match.
 * @param eloA     Current ELO of item A
 * @param eloB     Current ELO of item B
 * @param gamesA   Games played by item A (for K-factor)
 * @param gamesB   Games played by item B (for K-factor)
 * @param aWon     True if A won, false if B won
 */
export function calculateElo(
  eloA: number,
  eloB: number,
  gamesA: number,
  gamesB: number,
  aWon: boolean
): EloResult {
  const kA = getKFactor(gamesA);
  const kB = getKFactor(gamesB);
  const expectedA = expectedScore(eloA, eloB);
  const expectedB = 1 - expectedA;
  const scoreA = aWon ? 1 : 0;
  const scoreB = aWon ? 0 : 1;

  return {
    newEloA: Math.round(eloA + kA * (scoreA - expectedA)),
    newEloB: Math.round(eloB + kB * (scoreB - expectedB)),
  };
}
