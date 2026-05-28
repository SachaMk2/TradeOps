// Simple UUID v4 generator (no external dependency)
export function v4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const setupIds = Array.from({ length: 5 }, () => v4());
export const sessionIds = Array.from({ length: 3 }, () => v4());
export const tradeIds = Array.from({ length: 50 }, () => v4());
