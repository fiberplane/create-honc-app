function getNumberBetween(min: number, max: number) {
  // + 1 for inclusivity
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** @returns A number between 50 and 100, using Math.random */
export function generateId() {
  return getNumberBetween(50, 100);
}
