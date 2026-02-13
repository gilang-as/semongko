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
	if (Game.elements.menuScreen) {
		Game.elements.menuScreen.style.display = 'flex';
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
			restartGame();
		});
	}

	// Settings button handler
	const settingsButton = document.getElementById('btn-settings');
	const settingsPopup = document.getElementById('popup-settings');
	const audioVolumeSlider = document.getElementById('audio-volume') as HTMLInputElement;
	const audioVolumeValue = document.getElementById('audio-volume-value');
	const musicVolumeSlider = document.getElementById('music-volume') as HTMLInputElement;
	const musicVolumeValue = document.getElementById('music-volume-value');
	const resumeBtn = document.getElementById('btn-resume');
	const restartFromSettingsBtn = document.getElementById('btn-restart');
	
	if (settingsButton && settingsPopup) {
		settingsButton.addEventListener('click', () => {
			settingsPopup.style.display = 'flex';
			Runner.stop(runner);
			// Update slider values
			if (audioVolumeSlider && audioVolumeValue) {
				audioVolumeSlider.value = String(Math.round(Game.audioVolume * 100));
				audioVolumeValue.textContent = `${Math.round(Game.audioVolume * 100)}%`;
			}
			if (musicVolumeSlider && musicVolumeValue) {
				musicVolumeSlider.value = String(Math.round(Game.musicVolume * 100));
				musicVolumeValue.textContent = `${Math.round(Game.musicVolume * 100)}%`;
			}
		});
	}
	
	// Audio Volume Slider
	if (audioVolumeSlider && audioVolumeValue) {
		audioVolumeSlider.addEventListener('input', () => {
			const volume = parseInt(audioVolumeSlider.value) / 100;
			Game.audioVolume = volume;
			localStorage.setItem('audioVolume', String(volume));
			audioVolumeValue.textContent = `${audioVolumeSlider.value}%`;
		});
	}
	
	// Music Volume Slider
	if (musicVolumeSlider && musicVolumeValue) {
		musicVolumeSlider.addEventListener('input', () => {
			const volume = parseInt(musicVolumeSlider.value) / 100;
			Game.musicVolume = volume;
			Game.bgm.volume = volume;
			localStorage.setItem('musicVolume', String(volume));
			musicVolumeValue.textContent = `${musicVolumeSlider.value}%`;
			
			// Start or stop BGM based on volume
			if (volume > 0 && Game.bgm.paused && Game.stateIndex !== GameStates.MENU) {
				Game.bgm.play().catch(() => {});
			} else if (volume === 0) {
				Game.bgm.pause();
			}
		});
	}
	
	// Resume button (close settings and resume game)
	if (resumeBtn && settingsPopup) {
		resumeBtn.addEventListener('click', () => {
			settingsPopup.style.display = 'none';
			Runner.run(runner, engine);
		});
	}
	
	// Restart button in settings
	if (restartFromSettingsBtn) {
		restartFromSettingsBtn.addEventListener('click', () => {
			if (settingsPopup) {
				settingsPopup.style.display = 'none';
			}
			restartGame();
		});
	}

	// Info button handler
	const infoButton = document.getElementById('btn-info');
	const infoPopup = document.getElementById('popup-info');
	const closeInfo = document.getElementById('close-info');
	if (infoButton && infoPopup && closeInfo) {
		infoButton.addEventListener('click', () => {
			infoPopup.style.display = 'flex';
			Runner.stop(runner);
		});
		closeInfo.addEventListener('click', () => {
			infoPopup.style.display = 'none';
			Runner.run(runner, engine);
		});
	}
};

/**
 * Restarts the game by clearing all fruits and resetting state
 */
function restartGame(): void {
	// Remove all non-static bodies (fruits) from the world
	const allBodies = Composite.allBodies(engine.world);
	const dynamicBodies = allBodies.filter(body => !body.isStatic);
	Composite.remove(engine.world, dynamicBodies);

	// Reset game state
	Game.score = 0;
	Game.fruitsMerged = Array(Game.fruitSizes.length).fill(0);
	Game.calculateScore();

	// Hide end screen
	if (Game.elements.end) {
		Game.elements.end.style.display = 'none';
	}

	// Reset preview ball
	Game.elements.previewBall = Game.generateFruitBody(Game.width / 2, previewBallHeight, 0, { isStatic: true });
	Composite.add(engine.world, Game.elements.previewBall);

	// Set initial fruit sizes
	Game.setNextFruitSize();
	Game.currentFruitSize = Game.nextFruitSize;
	Game.setNextFruitSize();

	// Re-enable runner and set state to ready
	runner.enabled = true;
	Runner.run(runner, engine);

	setTimeout(() => {
		Game.stateIndex = GameStates.READY;
	}, 250);
}

/**
 * Start the game
 * Transitions from menu to gameplay, sets up event handlers
 */
Game.startGame = function(): void {
	if (Game.audioVolume > 0) {
		const clickSound = Game.sounds.click.cloneNode() as HTMLAudioElement;
		clickSound.volume = Game.audioVolume;
		clickSound.play().catch(() => {});
	}

	// Start background music
	if (Game.musicVolume > 0) {
		Game.bgm.volume = Game.musicVolume;
		Game.bgm.play().catch(() => {});
	}

	// Hide menu screen
	if (Game.elements.menuScreen) {
		Game.elements.menuScreen.style.display = 'none';
	}

	// Show game screen
	const gameWrapper = document.querySelector('.game-wrapper') as HTMLElement;
	if (gameWrapper) {
		gameWrapper.style.display = 'flex';
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
			const maxRadius = Game.fruitSizes[Game.fruitSizes.length - 1].radius;
			if (maxRadius && (bodyA.circleRadius || 0) >= maxRadius) {
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
			if (Game.audioVolume > 0) {
				const popSound = Game.sounds[`pop${fruitA.sizeIndex}`].cloneNode() as HTMLAudioElement;
				popSound.volume = Game.audioVolume;
				popSound.play().catch(() => {});
			}
			
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

	if (Game.audioVolume > 0) {
		const clickSound = Game.sounds.click.cloneNode() as HTMLAudioElement;
		clickSound.volume = Game.audioVolume;
		clickSound.play().catch(() => {});
	}

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
 * Resize canvas to fit viewport with scaling
 * Canvas internal size is fixed (640x1080), visual size scales
 * Header and footer flex to fill remaining vertical space
 */
const resizeCanvas = (): void => {
	// Use visualViewport for better mobile support
	const screenWidth = window.visualViewport?.width ?? window.innerWidth;
	const screenHeight = window.visualViewport?.height ?? window.innerHeight;
	
	// Fixed game dimensions (internal resolution)
	const gameWidth = 640;
	const gameHeight = 1080;
	
	// Calculate scale to fit screen (leave space for header min-height)
	const minHeaderSpace = 60; // min-height for header only
	const availableHeight = screenHeight - minHeaderSpace;
	const scaleX = screenWidth / gameWidth;
	const scaleY = availableHeight / gameHeight;
	const scale = Math.min(scaleX, scaleY); // Use available space
	
	// Calculate visual canvas size
	const visualWidth = gameWidth * scale;
	const visualHeight = gameHeight * scale;
	
	// Apply visual size to canvas
	render.canvas.style.width = `${visualWidth}px`;
	render.canvas.style.height = `${visualHeight}px`;
	
	// Scale menu screen to match (flexbox handles height automatically)
	const menuScreen = document.getElementById('menu-screen');
	if (menuScreen) {
		menuScreen.style.width = `${visualWidth}px`;
	}
	
	// Scale header to match canvas width
	const gameHeader = document.getElementById('game-header');
	if (gameHeader) {
		gameHeader.style.width = `${visualWidth}px`;
	}
	
	// UI overlay scales the same
	if (Game.elements.ui) {
		Game.elements.ui.style.width = `${gameWidth}px`;
		Game.elements.ui.style.height = `${gameHeight}px`;
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
