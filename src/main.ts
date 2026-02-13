import Matter from 'matter-js';
import { Game } from './game';
import { engine, runner, render, gameStatics, mouseConstraint } from './physics';
import { loseHeight, previewBallHeight } from './constants';
import { GameStates, FruitBody } from './types';
import { rand } from './utils';

const { Render, Runner, Composite, Bodies, Events } = Matter;

/**
 * Initialize the game
 * Sets up physics, loads high score, and prepares menu
 */
Game.initGame = function(): void {
	Render.run(render);
	Runner.run(runner, engine);

	Game.loadHighscore();
	if (Game.elements.ui) {
		Game.elements.ui.style.display = 'block';
	}
	if (Game.elements.menu) {
		Game.elements.menu.style.display = 'flex';
	}
	Game.fruitsMerged = Array(Game.fruitSizes.length).fill(0);

	// HTML button click handler
	const startButton = document.getElementById('btn-start-game');
	if (startButton) {
		startButton.addEventListener('click', () => {
			Game.startGame();
		});
	}

	// Restart button handler
	const restartButton = document.getElementById('game-end-link');
	if (restartButton) {
		restartButton.addEventListener('click', () => {
			window.location.reload();
		});
	}
};

/**
 * Start the game
 * Transitions from menu to gameplay, sets up event handlers
 */
Game.startGame = function(): void {
	Game.sounds.click.play();

	// Hide menu
	if (Game.elements.menu) {
		Game.elements.menu.style.display = 'none';
	}

	Composite.add(engine.world, gameStatics);

	Game.calculateScore();
	if (Game.elements.endTitle) {
		Game.elements.endTitle.innerText = 'Game Over!';
	}
	if (Game.elements.end) {
		Game.elements.end.style.display = 'none';
	}
	Game.elements.previewBall = Game.generateFruitBody(Game.width / 2, previewBallHeight, 0, { isStatic: true });
	Composite.add(engine.world, Game.elements.previewBall);

	setTimeout(() => {
		Game.stateIndex = GameStates.READY;
	}, 250);

	// Mouse/touch drop event
	Events.on(mouseConstraint, 'mouseup', () => {
		Game.addFruit(mouseConstraint.mouse.position.x);
	});

	// Mouse/touch move event
	Events.on(mouseConstraint, 'mousemove', () => {
		if (Game.stateIndex !== GameStates.READY) return;
		if (Game.elements.previewBall === null) return;

		Game.elements.previewBall.position.x = mouseConstraint.mouse.position.x;
	});

	// Collision detection
	Events.on(engine, 'collisionStart', (e: Matter.IEventCollision<Matter.Engine>) => {
		for (let i = 0; i < e.pairs.length; i++) {
			const { bodyA, bodyB } = e.pairs[i];

			// Skip if collision is wall
			if (bodyA.isStatic || bodyB.isStatic) continue;

			const aY = bodyA.position.y + (bodyA.circleRadius || 0);
			const bY = bodyB.position.y + (bodyB.circleRadius || 0);

			// Check lose condition - fruit too high
			if (aY < loseHeight || bY < loseHeight) {
				Game.loseGame();
				return;
			}

			// Check if both bodies have sizeIndex property (are fruits)
			const fruitA = bodyA as FruitBody;
			const fruitB = bodyB as FruitBody;
			
			if (fruitA.sizeIndex === undefined || fruitB.sizeIndex === undefined) continue;

			// Skip different sizes
			if (fruitA.sizeIndex !== fruitB.sizeIndex) continue;

			// Skip if already popped
			if (fruitA.popped || fruitB.popped) continue;

			let newSize = fruitA.sizeIndex + 1;

			// Go back to smallest size if max fruit reached
			if ((bodyA.circleRadius || 0) >= Game.fruitSizes[Game.fruitSizes.length - 1].radius) {
				newSize = 0;
			}

			Game.fruitsMerged[fruitA.sizeIndex] += 1;

			// Calculate midpoint for merged fruit
			const midPosX = (bodyA.position.x + bodyB.position.x) / 2;
			const midPosY = (bodyA.position.y + bodyB.position.y) / 2;

			// Mark fruits as popped
			fruitA.popped = true;
			fruitB.popped = true;

			// Play merge sound
			Game.sounds[`pop${fruitA.sizeIndex}`].play();
			
			// Remove old fruits and add merged fruit
			Composite.remove(engine.world, [bodyA, bodyB]);
			Composite.add(engine.world, Game.generateFruitBody(midPosX, midPosY, newSize));
			
			// Show pop animation
			Game.addPop(midPosX, midPosY, (bodyA.circleRadius || 0));
			
			// Update score
			Game.calculateScore();
		}
	});
};

/**
 * Add pop animation
 * Shows a brief sprite animation when fruits merge
 */
Game.addPop = function(x: number, y: number, r: number): void {
	const circle = Bodies.circle(x, y, r, {
		isStatic: true,
		collisionFilter: { mask: 0x0040 },
		angle: rand() * (Math.PI * 2),
		render: {
			sprite: {
				texture: './assets/img/pop.png',
				xScale: r / 384,
				yScale: r / 384,
			}
		},
	});

	Composite.add(engine.world, circle);
	setTimeout(() => {
		Composite.remove(engine.world, circle);
	}, 100);
};

/**
 * Lose game handler
 * Updates runner state
 */
const originalLoseGame = Game.loseGame;
Game.loseGame = function(): void {
	originalLoseGame();
	runner.enabled = false;
};

/**
 * Add fruit to the game
 * Drops a new fruit at the specified x position
 */
Game.addFruit = function(x: number): void {
	if (Game.stateIndex !== GameStates.READY) return;

	Game.sounds.click.play();

	Game.stateIndex = GameStates.DROP;
	const latestFruit = Game.generateFruitBody(x, previewBallHeight, Game.currentFruitSize);
	Composite.add(engine.world, latestFruit);

	Game.currentFruitSize = Game.nextFruitSize;
	Game.setNextFruitSize();
	Game.calculateScore();

	if (Game.elements.previewBall) {
		Composite.remove(engine.world, Game.elements.previewBall);
	}
	Game.elements.previewBall = Game.generateFruitBody(render.mouse.position.x, previewBallHeight, Game.currentFruitSize, {
		isStatic: true,
		collisionFilter: { mask: 0x0040 }
	});

	setTimeout(() => {
		if (Game.stateIndex === GameStates.DROP && Game.elements.previewBall) {
			Composite.add(engine.world, Game.elements.previewBall);
			Game.stateIndex = GameStates.READY;
		}
	}, 500);
};

/**
 * Resize canvas to fit viewport responsively
 * Canvas stays within game-box container, preventing stretching
 */
const resizeCanvas = (): void => {
	// Get the game box container
	const gameBox = document.querySelector('.game-box') as HTMLElement;
	if (!gameBox) return;

	// Use visualViewport for better mobile support, fallback to window dimensions
	const screenWidth = window.visualViewport?.width ?? window.innerWidth;
	const screenHeight = window.visualViewport?.height ?? window.innerHeight;
	const gameAspectRatio = Game.width / Game.height; // 640 / 960 = 0.667
	
	// Define constraints
	const minCanvasWidth = 320; // Minimum width for mobile
	const maxCanvasWidth = 640; // Maximum width for desktop

	// Get available space within the box
	const boxRect = gameBox.getBoundingClientRect();
	const availableWidth = Math.min(boxRect.width, screenWidth);
	const availableHeight = Math.min(boxRect.height, screenHeight);

	// Calculate canvas size based on available space
	let newHeight = availableHeight;
	let newWidth = newHeight * gameAspectRatio;

	// Apply width constraints
	if (newWidth < minCanvasWidth) {
		newWidth = minCanvasWidth;
		newHeight = newWidth / gameAspectRatio;
	}
	
	// Constrain width to max
	if (newWidth > maxCanvasWidth) {
		newWidth = Math.min(maxCanvasWidth, availableWidth);
	}

	// Only reduce if width exceeds available width
	if (newWidth > availableWidth) {
		newWidth = availableWidth;
		newHeight = newWidth / gameAspectRatio;
	}

	// Ensure height fits in available space
	if (newHeight > availableHeight) {
		newHeight = availableHeight;
		newWidth = newHeight * gameAspectRatio;
	}

	// Calculate scale for UI
	const scaleX = newWidth / Game.width;
	const scaleY = newHeight / Game.height;
	const scale = Math.min(scaleX, scaleY);

	render.canvas.style.width = `${newWidth}px`;
	render.canvas.style.height = `${newHeight}px`;

	if (Game.elements.ui) {
		Game.elements.ui.style.width = `${Game.width}px`;
		Game.elements.ui.style.height = `${Game.height}px`;
		Game.elements.ui.style.transform = `scale(${scale})`;
		Game.elements.ui.style.transformOrigin = 'top left';
	}
};

// Initialize game on load
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
// Handle orientation changes on mobile
window.addEventListener('orientationchange', () => {
	setTimeout(resizeCanvas, 100);
});
// Handle visualViewport resize for mobile browsers
if (window.visualViewport) {
	window.visualViewport.addEventListener('resize', resizeCanvas);
}

Game.initGame();
