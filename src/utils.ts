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

/**
 * Audio Pool Manager for better performance on mobile
 * Avoids creating new audio instances every time
 */
class AudioPool {
	private pools: Map<string, HTMLAudioElement[]> = new Map();
	private maxPoolSize = 3; // Maximum instances per sound

	/**
	 * Play a sound with volume control using pooling
	 * @param audio - The base audio element
	 * @param volume - Volume level (0-1)
	 */
	play(audio: HTMLAudioElement, volume: number): void {
		if (volume === 0) return;

		const src = audio.src;
		
		// Get or create pool for this sound
		if (!this.pools.has(src)) {
			this.pools.set(src, []);
		}
		
		const pool = this.pools.get(src)!;
		
		// Find an available audio element in the pool
		let availableAudio = pool.find(a => a.paused || a.ended);
		
		// If none available and pool not full, create new one
		if (!availableAudio && pool.length < this.maxPoolSize) {
			availableAudio = audio.cloneNode() as HTMLAudioElement;
			pool.push(availableAudio);
		}
		
		// If still none available, use the oldest one (first in pool)
		if (!availableAudio) {
			availableAudio = pool[0];
			availableAudio.pause();
			availableAudio.currentTime = 0;
		}
		
		// Play the audio
		availableAudio.volume = volume;
		availableAudio.currentTime = 0;
		availableAudio.play().catch(() => {
			// Ignore play errors (common on mobile before user interaction)
		});
	}
}

export const audioPool = new AudioPool();
