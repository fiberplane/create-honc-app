function getNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// todo: params
export function generateId() {
  return getNumberBetween(50, 100);
}

export function parseId(value: string | string[]) {
  const maybeId = Number(value);

  if (Number.isNaN(maybeId)) {
    return -1;
  }

  return maybeId;
}
