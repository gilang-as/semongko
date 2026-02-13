// Utility Functions

/**
 * Mulberry32 pseudo-random number generator
 * @param a Seed value
 * @returns Function that generates random numbers between 0 and 1
 */
export function mulberry32(a: number): () => number {
	return function(): number {
		let t = a += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}

// Initialize random number generator
export const rand = mulberry32(Date.now());
