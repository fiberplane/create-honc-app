function getNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// todo: params
export function generateId() {
  return getNumberBetween(50, 100);
}

export function isProduction() {
  return process.env.ENVIRONMENT === "production";
}
