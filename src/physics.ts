import Matter from 'matter-js';
import { Game } from './game';
import { wallPad, statusBarHeight, friction, GAME_WIDTH, GAME_HEIGHT } from './constants';

const { Engine, Render, Runner, Bodies } = Matter;

/**
 * Matter.js Physics Engine
 */
export const engine = Engine.create();

/**
 * Matter.js Runner - handles game loop
 */
export const runner = Runner.create();

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
		background: '#ffdcae'
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
