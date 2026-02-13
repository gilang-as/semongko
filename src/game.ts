import Matter from 'matter-js';
import { GameInterface, GameStates, FruitBody } from './types';
import { friction } from './constants';
import { rand } from './utils';

const { Bodies } = Matter;

/**
 * Creates vertices for a circular polygon approximation
 * @param radius - The radius of the circle
 * @param sides - Number of sides for the polygon (default: 32)
 * @returns Array of vertices centered around (0,0)
 */
function createCircleVertices(radius: number, sides: number = 32): Matter.Vector[] {
	const vertices: Matter.Vector[] = [];
	const angleStep = (2 * Math.PI) / sides;
	
	for (let i = 0; i < sides; i++) {
		const angle = i * angleStep;
		vertices.push({
			x: radius * Math.cos(angle),
			y: radius * Math.sin(angle)
		});
	}
	
	return vertices;
}

/**
 * Main Game Object
 * Contains all game state, logic, and methods
 */
export const Game: GameInterface = {
	width: 640,
	height: 1080,
	elements: {
		canvas: document.getElementById('game-canvas'),
		ui: document.getElementById('game-ui'),
		score: document.getElementById('game-score'),
		end: document.getElementById('game-end-container'),
		endTitle: document.getElementById('game-end-title'),
		statusValue: document.getElementById('game-highscore-value'),
		nextFruitImg: document.getElementById('game-next-fruit-header') as HTMLImageElement | null,
		previewBall: null,
		menuScreen: document.getElementById('menu-screen'),
	},
	cache: { highscore: 0 },
	sounds: {
		click: new Audio('./assets/click.mp3'),
		pop0: new Audio('./assets/pop0.mp3'),
		pop1: new Audio('./assets/pop1.mp3'),
		pop2: new Audio('./assets/pop2.mp3'),
		pop3: new Audio('./assets/pop3.mp3'),
		pop4: new Audio('./assets/pop4.mp3'),
		pop5: new Audio('./assets/pop5.mp3'),
		pop6: new Audio('./assets/pop6.mp3'),
		pop7: new Audio('./assets/pop7.mp3'),
		pop8: new Audio('./assets/pop8.mp3'),
		pop9: new Audio('./assets/pop9.mp3'),
		pop10: new Audio('./assets/pop10.mp3'),
	},
	bgm: (() => {
		const music = new Audio('./assets/music/bgm/music.webm');
		music.loop = true;
		return music;
	})(),
	audioVolume: parseFloat(localStorage.getItem('audioVolume') || '0.7'),
	musicVolume: parseFloat(localStorage.getItem('musicVolume') || '0.5'),

	stateIndex: GameStates.MENU,
	score: 0,
	fruitsMerged: [],

	calculateScore(): void {
		const score = Game.fruitsMerged.reduce((total, count, sizeIndex) => {
			const value = Game.fruitSizes[sizeIndex].scoreValue * count;
			return total + value;
		}, 0);

		Game.score = score;
		if (Game.elements.score) {
			Game.elements.score.innerText = Game.score.toString();
		}
	},

	fruitSizes: [
		{ image: './assets/img/circle0.png',  textureSize: 1024, scoreValue: 2,  scale: 0.047 },
		{ image: './assets/img/circle1.png',  textureSize: 150,  scoreValue: 5,  scale: 0.426 },
		{ image: './assets/img/circle2.png',  textureSize: 228,  scoreValue: 9,  scale: 0.351 },
		{ image: './assets/img/circle3.png',  textureSize: 225,  scoreValue: 13, scale: 0.498 },
		{ image: './assets/img/circle4.png',  textureSize: 286,  scoreValue: 18, scale: 0.448 },
		{ image: './assets/img/circle5.png',  textureSize: 350,  scoreValue: 25, scale: 0.411 },
		{ image: './assets/img/circle6.png',  textureSize: 418,  scoreValue: 34, scale: 0.402 },
		{ image: './assets/img/circle7.png',  textureSize: 484,  scoreValue: 41, scale: 0.397 },
		{ image: './assets/img/circle8.png',  textureSize: 609,  scoreValue: 49, scale: 0.420 },
		{ image: './assets/img/circle9.png',  textureSize: 661,  scoreValue: 58, scale: 0.484 },
		{ image: './assets/img/circle10.png', textureSize: 778,  scoreValue: 65, scale: 0.493 },
	],
	
	currentFruitSize: 0,
	nextFruitSize: 0,

	setNextFruitSize(): void {
		Game.nextFruitSize = Math.floor(rand() * 5);
		if (Game.elements.nextFruitImg) {
			Game.elements.nextFruitImg.src = Game.fruitSizes[Game.nextFruitSize].image;
		}
	},

	showHighscore(): void {
		if (Game.elements.statusValue) {
			Game.elements.statusValue.innerText = Game.cache.highscore.toString();
		}
	},

	loadHighscore(): void {
		const gameCache = localStorage.getItem('suika-game-cache');
		if (gameCache === null) {
			Game.saveHighscore();
			return;
		}

		Game.cache = JSON.parse(gameCache);
		Game.showHighscore();
	},

	saveHighscore(): void {
		Game.calculateScore();
		if (Game.score < Game.cache.highscore) return;

		Game.cache.highscore = Game.score;
		Game.showHighscore();
		if (Game.elements.endTitle) {
			Game.elements.endTitle.innerText = 'New Highscore!';
		}

		localStorage.setItem('suika-game-cache', JSON.stringify(Game.cache));
	},

	initGame(): void {
		// Implementation in main.ts
	},

	startGame(): void {
		// Implementation in main.ts
	},

	addPop(_x: number, _y: number, _r: number): void {
		// Implementation in main.ts
	},

	loseGame(): void {
		Game.stateIndex = GameStates.LOSE;
		if (Game.elements.end) {
			Game.elements.end.style.display = 'flex';
		}
		// Runner will be disabled in main.ts
		Game.saveHighscore();
	},

	lookupFruitIndex(radius: number): number | null {
		// Find fruit by computed radius (with tolerance for floating point)
		const tolerance = 0.5;
		const sizeIndex = Game.fruitSizes.findIndex(size => {
			const physicsScale = size.physicsScale ?? size.scale;
			const physicsSize = size.textureSize * physicsScale;
			const actualRadius = physicsSize / 2;
			return Math.abs(actualRadius - radius) < tolerance;
		});
		if (sizeIndex === -1) return null;
		if (sizeIndex === Game.fruitSizes.length - 1) return null;
		return sizeIndex;
	},

	generateFruitBody(x: number, y: number, sizeIndex: number, extraConfig: Partial<Matter.IBodyDefinition> = {}): FruitBody {
		const config = Game.fruitSizes[sizeIndex];
		
		// Each fruit has its own texture size
		const textureSize = config.textureSize;
		const displayScale = config.scale;  // For sprite display
		const physicsScale = config.physicsScale ?? config.scale;  // For physics body (defaults to displayScale)
		
		// Calculate sizes
		const physicsSize = textureSize * physicsScale;  // Physics body size
		const radius = physicsSize / 2;  // Physics uses physicsScale
		
		// Store computed radius for reference
		config.radius = radius;
		
		// Generate vertices based on shape type
		let vertices: Matter.Vector[];
		const shapeType = config.shapeType ?? 'circle';
		if (shapeType === 'custom' && config.createVertices) {
			vertices = config.createVertices(radius);
		} else {
			// Default to circle with configurable sides
			const sides = config.sides ?? 32;
			vertices = createCircleVertices(radius, sides);
		}
		
		// Sprite scale for display (uses displayScale)
		const spriteScale = displayScale;
		
		const body = Bodies.fromVertices(x, y, [vertices], {
			...friction,
			...extraConfig,
			render: { 
				sprite: { 
					texture: config.image, 
					xScale: spriteScale, 
					yScale: spriteScale
				} 
			},
		}, true) as FruitBody;
		
		body.sizeIndex = sizeIndex;
		body.popped = false;
		return body;
	},

	addFruit(_x: number): void {
		// Implementation in main.ts
	}
};
