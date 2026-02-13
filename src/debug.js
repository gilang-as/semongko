import { Game } from './game.ts';
import Matter from 'matter-js';

let fruitGrid;
let zoomSlider;
let zoomValue;
let zoomInBtn;
let zoomOutBtn;

let currentZoom = 1;

// Initialize when DOM is ready
function initialize() {
	// Get DOM elements
	fruitGrid = document.getElementById('fruitGrid');
	zoomSlider = document.getElementById('zoomSlider');
	zoomValue = document.getElementById('zoomValue');
	zoomInBtn = document.getElementById('zoomIn');
	zoomOutBtn = document.getElementById('zoomOut');
	
	if (!fruitGrid) {
		console.error('fruitGrid element not found!');
		return;
	}
	
	// Set up event listeners
	setupEventListeners();
	
	// Initial render
	redrawAllFruits();
}

// Check if DOM is already loaded or wait for it
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initialize);
} else {
	// DOM already loaded, initialize immediately
	initialize();
}

function setupEventListeners() {
	// Zoom controls
	zoomSlider.addEventListener('input', (e) => {
		updateZoom(parseFloat(e.target.value));
	});

	zoomInBtn.addEventListener('click', () => {
		const newZoom = Math.min(3, currentZoom + 0.1);
		updateZoom(newZoom);
	});

	zoomOutBtn.addEventListener('click', () => {
		const newZoom = Math.max(0.5, currentZoom - 0.1);
		updateZoom(newZoom);
	});
}

// Zoom controls
function updateZoom(zoom) {
	currentZoom = zoom;
	zoomSlider.value = zoom;
	zoomValue.textContent = Math.round(zoom * 100) + '%';
	
	// Redraw all fruits with new zoom
	redrawAllFruits();
}

// Helper function to create circle vertices (same as in game.ts)
function createCircleVertices(radius, sides = 32) {
	const vertices = [];
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

// Draw vertices on canvas comparing input (from radius) vs physics engine output
function drawVertices(canvas, expectedVertices, actualVertices, radius, zoom = 1) {
	const ctx = canvas.getContext('2d');
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// Draw input vertices (generated from radius physics) in GREEN with dashed line
	ctx.beginPath();
	ctx.strokeStyle = '#4CAF50';
	ctx.lineWidth = 2;
	ctx.setLineDash([5, 5]); // Dashed line
	
	expectedVertices.forEach((vertex, index) => {
		const x = centerX + (vertex.x * zoom);
		const y = centerY + (vertex.y * zoom);
		
		if (index === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	});
	ctx.closePath();
	ctx.stroke();
	ctx.setLineDash([]); // Reset line dash
	
	// Draw physics engine output vertices in RED with solid line
	ctx.beginPath();
	ctx.strokeStyle = '#FF5722';
	ctx.lineWidth = 3;
	
	actualVertices.forEach((vertex, index) => {
		const x = centerX + (vertex.x * zoom);
		const y = centerY + (vertex.y * zoom);
		
		if (index === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	});
	ctx.closePath();
	ctx.stroke();
	
	// Draw center point
	ctx.beginPath();
	ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
	ctx.fillStyle = '#2196F3';
	ctx.fill();
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 2;
	ctx.stroke();
}

function createFruitCard(fruit, index, zoom) {
	const card = document.createElement('div');
	card.className = 'fruit-card';
	
	// Each fruit has its own texture size
	const textureSize = fruit.textureSize;
	const displayScale = fruit.scale;  // For sprite display
	const physicsScale = fruit.physicsScale ?? fruit.scale;  // For physics (defaults to displayScale)
	const displaySize = textureSize * displayScale;  // Visual size
	const physicsSize = textureSize * physicsScale;  // Physics body size
	const radius = physicsSize / 2;  // Physics radius
	const sides = fruit.sides || 32;
	
	// Create input vertices from computed radius (what we send to Matter.js)
	const expectedVertices = createCircleVertices(radius, sides);
	
	// Create physics body and extract actual vertices from Matter.js engine output
	const body = Game.generateFruitBody(0, 0, index);
	const actualVertices = body.vertices.map(v => ({
		x: v.x - body.position.x,
		y: v.y - body.position.y
	}));
	
	// Sprite scale for display
	const spriteScale = displayScale;
	const actualImageSize = displaySize * zoom; // Image size scales with zoom
	const gridPixelSize = 10 * zoom; // Grid scales with zoom
	
	const shapeType = fruit.shapeType ?? 'circle';
	const shapeClass = shapeType === 'circle' ? 'shape-circle' : 'shape-custom';
	const shapeLabel = shapeType === 'circle' ? 'Circle' : 'Custom';
	
	// Fixed container size for card consistency
	const containerSize = 424; // Fixed size (fits largest fruit at 1x zoom with padding)
	
	card.innerHTML = `
		<div class="fruit-header">
			<div class="fruit-index">Fruit #${index}</div>
			<div class="fruit-score">Score: ${fruit.scoreValue}</div>
		</div>
		
		<div class="fruit-visual">
			<div class="fruit-visual-inner" style="--zoom: ${zoom};">
				<div class="grid-container">
					<div class="fruit-container" style="width: ${containerSize}px; height: ${containerSize}px;">
						<canvas 
							class="vertices-canvas" 
							width="${containerSize}" 
							height="${containerSize}"
							data-fruit-index="${index}"
						></canvas>
						<img 
							src="${fruit.image}" 
							alt="Fruit ${index}"
							class="fruit-image"
							style="width: ${actualImageSize}px; height: ${actualImageSize}px;"
						>
					</div>
				</div>
			</div>
			<div class="grid-label">Grid: ${gridPixelSize.toFixed(1)}px | Zoom: ${Math.round(zoom * 100)}%</div>
		</div>
		
		<div class="fruit-info">
			<div class="info-row">
				<span class="info-label">Shape Type:</span>
				<span class="shape-indicator ${shapeClass}">${shapeLabel}</span>
			</div>
			<div class="info-row editable-row">
				<span class="info-label">Texture Size:</span>
				<div class="value-control">
					<button class="control-btn minus" data-fruit="${index}" data-field="textureSize">−</button>
					<input type="number" class="value-input" data-fruit="${index}" data-field="textureSize" value="${textureSize}" min="1" max="2048">
					<button class="control-btn plus" data-fruit="${index}" data-field="textureSize">+</button>
					<span class="unit">px</span>
				</div>
			</div>
			<div class="info-row editable-row">
				<span class="info-label">Display Scale (Image):</span>
				<div class="value-control">
					<button class="control-btn minus" data-fruit="${index}" data-field="scale">−</button>
					<input type="number" class="value-input" data-fruit="${index}" data-field="scale" value="${displayScale.toFixed(3)}" min="0.01" max="2" step="0.01">
					<button class="control-btn plus" data-fruit="${index}" data-field="scale">+</button>
				</div>
			</div>
			<div class="info-row">
				<span class="info-label">Display Size:</span>
				<span class="info-value" style="background: #e3f2fd; color: #1976d2;">${displaySize.toFixed(1)}px</span>
			</div>
			<div class="info-row editable-row">
				<span class="info-label">Physics Scale:</span>
				<div class="value-control">
					<button class="control-btn minus" data-fruit="${index}" data-field="physicsScale">−</button>
					<input type="number" class="value-input" data-fruit="${index}" data-field="physicsScale" value="${physicsScale.toFixed(3)}" min="0.01" max="2" step="0.01">
					<button class="control-btn plus" data-fruit="${index}" data-field="physicsScale">+</button>
				</div>
			</div>
			<div class="info-row">
				<span class="info-label">Physics Size:</span>
				<span class="info-value" style="background: #ffebee; color: #c62828; font-weight: bold;">${physicsSize.toFixed(1)}px (radius: ${radius.toFixed(1)}px)</span>
			</div>
			<div class="info-row">
				<span class="info-label">Sprite Scale:</span>
				<span class="info-value">${spriteScale.toFixed(4)}</span>
			</div>
			<div class="info-row editable-row">
				<span class="info-label">Polygon Sides:</span>
				<div class="value-control">
					<button class="control-btn minus" data-fruit="${index}" data-field="sides">−</button>
					<input type="number" class="value-input" data-fruit="${index}" data-field="sides" value="${sides}" min="3" max="128">
					<button class="control-btn plus" data-fruit="${index}" data-field="sides">+</button>
				</div>
			</div>
			<div class="info-row">
				<span class="info-label">Image Path:</span>
				<span class="info-value" style="font-size: 0.8em; word-break: break-all;">${fruit.image}</span>
			</div>
		</div>
	`;
	
	fruitGrid.appendChild(card);
	
	// Add event listeners for controls
	setupCardControls(card, index);
	
	// Draw input vertices (from radius) vs physics engine output on canvas
	const canvas = card.querySelector('.vertices-canvas');
	drawVertices(canvas, expectedVertices, actualVertices, fruit.radius, zoom);
}

function setupCardControls(card, fruitIndex) {
	const buttons = card.querySelectorAll('.control-btn');
	const inputs = card.querySelectorAll('.value-input');
	
	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const fruit = parseInt(btn.dataset.fruit);
			const field = btn.dataset.field;
			const isPlus = btn.classList.contains('plus');
			const input = card.querySelector(`input[data-fruit="${fruit}"][data-field="${field}"]`);
			const currentValue = parseFloat(input.value);
			
			let step = 1;
			if (field === 'scale' || field === 'physicsScale') {
				step = 0.01;  // 1% increment for better visibility
			} else if (field === 'sides') {
				step = 1;
			} else if (field === 'textureSize') {
				step = 1;
			}
			
			const newValue = isPlus ? currentValue + step : currentValue - step;
			const min = parseFloat(input.min);
			const max = parseFloat(input.max);
			
			if (newValue >= min && newValue <= max) {
				if (field === 'scale' || field === 'physicsScale') {
					input.value = newValue.toFixed(3);
				} else {
					input.value = Math.round(newValue);
				}
				updateFruitValue(fruit, field, newValue);
			}
		});
	});
	
	inputs.forEach(input => {
		input.addEventListener('change', () => {
			const fruit = parseInt(input.dataset.fruit);
			const field = input.dataset.field;
			let value = parseFloat(input.value);
			const min = parseFloat(input.min);
			const max = parseFloat(input.max);
			
			// Validate
			if (value < min) value = min;
			if (value > max) value = max;
			
			if (field === 'scale' || field === 'physicsScale') {
				input.value = value.toFixed(3);
			} else {
				value = Math.round(value);
				input.value = value;
			}
			
			updateFruitValue(fruit, field, value);
		});
	});
}

function updateFruitValue(fruitIndex, field, value) {
	// Update the game configuration
	if (field === 'scale') {
		Game.fruitSizes[fruitIndex].scale = value;
	} else if (field === 'physicsScale') {
		Game.fruitSizes[fruitIndex].physicsScale = value;
	} else if (field === 'sides') {
		Game.fruitSizes[fruitIndex].sides = value;
	} else if (field === 'textureSize') {
		Game.fruitSizes[fruitIndex].textureSize = value;
	}
	
	// Redraw all fruits
	redrawAllFruits();
}

function redrawAllFruits() {
	if (!fruitGrid) {
		console.error('fruitGrid is null in redrawAllFruits');
		return;
	}
	
	fruitGrid.innerHTML = '';
	Game.fruitSizes.forEach((fruit, index) => {
		createFruitCard(fruit, index, currentZoom);
	});
}
