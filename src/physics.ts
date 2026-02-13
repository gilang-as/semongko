import Matter from 'matter-js';
import { Game } from './game';
import { wallPad, statusBarHeight, friction, GAME_WIDTH, GAME_HEIGHT } from './constants';

const { Engine, Render, Runner, Bodies } = Matter;

/**
 * Detect mobile device for performance optimizations
 */
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

/**
 * Matter.js Physics Engine with optimizations
 */
export const engine = Engine.create({
	enableSleeping: true, // Enable sleeping for better performance
});

// Optimize engine for mobile
if (isMobile) {
	engine.timing.timeScale = 1;
	engine.constraintIterations = 2; // Reduced from default 2
	engine.positionIterations = 4; // Reduced from default 6
	engine.velocityIterations = 2; // Reduced from default 4
}

/**
 * Matter.js Runner - handles game loop with mobile optimization
 */
export const runner = Runner.create({
	delta: 1000 / 60, // Target 60 FPS
	isFixed: false,
});

/**
 * Matter.js Renderer - handles canvas rendering
 */
export const render = Render.create({
	element: Game.elements.canvas as HTMLElement,
	engine,
	options: {
		width: GAME_WIDTH,
		height: GAME_HEIGHT,
		wireframes: false,
		background: '#ffdcae',
		showAngleIndicator: false, // Disable for performance
		showCollisions: false, // Disable for performance
		showSleeping: false, // Disable sleeping visual effect (no fading)
	}
});

/**
 * Menu Screen Static Bodies
 */
export const menuStatics = [
	Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.4, 512, 512, {
		isStatic: true,
		render: { sprite: { texture: './assets/img/bg-menu.png', xScale: 1, yScale: 1 } },
	}),

	// Add each fruit in a circle
	...Array(Game.fruitSizes.length).fill(0).map((_, index) => {
		const x = (GAME_WIDTH / 2) + 192 * Math.cos((Math.PI * 2 * index) / 12);
		const y = (GAME_HEIGHT * 0.4) + 192 * Math.sin((Math.PI * 2 * index) / 12);
		const r = 64;

		return Bodies.circle(x, y, r, {
			isStatic: true,
			render: {
				sprite: {
					texture: `./assets/img/circle${index}.png`,
					xScale: r / 1024,
					yScale: r / 1024,
				},
			},
		});
	}),

	Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.75, 512, 96, {
		isStatic: true,
		label: 'btn-start',
		render: { sprite: { texture: './assets/img/btn-start.png', xScale: 1, yScale: 0.1875 } },
	}),
];

/**
 * Wall Properties
 */
const wallProps = {
	isStatic: true,
	render: { fillStyle: '#FFEEDB' },
	...friction,
};

/**
 * Game Arena Static Bodies (walls and floor)
 */
export const gameStatics = [
	// Left wall
	Bodies.rectangle(-(wallPad / 2), GAME_HEIGHT / 2, wallPad, GAME_HEIGHT, wallProps),

	// Right wall
	Bodies.rectangle(GAME_WIDTH + (wallPad / 2), GAME_HEIGHT / 2, wallPad, GAME_HEIGHT, wallProps),

	// Bottom floor
	Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + (wallPad / 2) - statusBarHeight, GAME_WIDTH, wallPad, wallProps),
];

/**
 * Mouse Control
 */
const { Mouse, MouseConstraint } = Matter;
const mouse = Mouse.create(render.canvas);
export const mouseConstraint = MouseConstraint.create(engine, {
	mouse: mouse,
	constraint: {
		stiffness: 0.2,
		render: {
			visible: false,
		},
	},
});
render.mouse = mouse;
