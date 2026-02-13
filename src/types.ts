import Matter from 'matter-js';

// Types and Interfaces
export interface FruitSize {
	image: string;         // Path to texture image
	textureSize: number;   // Actual texture image size in pixels (width or height, use max)
	scoreValue: number;    // Score when fruit merges
	scale: number;         // Display size multiplier for sprite (0.5 = small, 1.0 = normal, 2.0 = large)
	physicsScale?: number; // Physics body size multiplier (optional, defaults to scale if not set)
	shapeType?: 'circle' | 'custom';  // Optional, defaults to 'circle'
	sides?: number;        // Optional polygon sides, defaults to 32
	createVertices?: (radius: number) => Matter.Vector[];
	// Deprecated: use 'image' instead
	img?: string;
	// Computed at runtime (do not set manually)
	radius?: number;       // Auto-calculated from textureSize * physicsScale / 2
}

export interface GameCache {
	highscore: number;
}

export interface GameElements {
	canvas: HTMLElement | null;
	ui: HTMLElement | null;
	score: HTMLElement | null;
	end: HTMLElement | null;
	endTitle: HTMLElement | null;
	statusValue: HTMLElement | null;
	nextFruitImg: HTMLImageElement | null;
	previewBall: Matter.Body | null;
	menu: HTMLElement | null;
}

export interface FruitBody extends Matter.Body {
	sizeIndex: number;
	popped: boolean;
}

export enum GameStates {
	MENU = 0,
	READY = 1,
	DROP = 2,
	LOSE = 3,
}

export interface GameInterface {
	width: number;
	height: number;
	elements: GameElements;
	cache: GameCache;
	sounds: Record<string, HTMLAudioElement>;
	stateIndex: GameStates;
	score: number;
	fruitsMerged: number[];
	fruitSizes: FruitSize[];
	currentFruitSize: number;
	nextFruitSize: number;
	calculateScore(): void;
	setNextFruitSize(): void;
	showHighscore(): void;
	loadHighscore(): void;
	saveHighscore(): void;
	initGame(): void;
	startGame(): void;
	addPop(x: number, y: number, r: number): void;
	loseGame(): void;
	lookupFruitIndex(radius: number): number | null;
	generateFruitBody(x: number, y: number, sizeIndex: number, extraConfig?: Partial<Matter.IBodyDefinition>): FruitBody;
	addFruit(x: number): void;
}
