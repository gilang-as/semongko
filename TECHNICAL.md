# Technical Documentation

## Architecture Overview

The Suika Game is built as a single-page application using TypeScript and the Matter.js physics engine. The architecture follows a modular design with clear separation of concerns.

## Core Components

### 1. Game Engine (`Game` object)

The main game object contains all game state, methods, and configuration:

```typescript
const Game: GameInterface = {
  width: 640,
  height: 960,
  elements: GameElements,     // DOM references
  cache: GameCache,           // Persistent data
  sounds: Record<string, HTMLAudioElement>,
  stateIndex: GameStates,
  score: number,
  fruitsMerged: number[],
  fruitSizes: FruitSize[],
  // ... methods
}
```

### 2. Physics Engine (Matter.js)

Matter.js handles all physics simulation:
- **Engine** - Core physics simulation
- **Render** - Canvas rendering
- **Runner** - Game loop execution
- **Bodies** - Physical objects (fruits, walls)
- **Events** - Collision detection

### 3. State Machine

The game uses a finite state machine with four states:

```typescript
enum GameStates {
  MENU = 0,    // Main menu screen
  READY = 1,   // Ready to drop fruit
  DROP = 2,    // Fruit is dropping
  LOSE = 3     // Game over
}
```

## Game Loop

### 1. Initialization (`initGame()`)
- Creates physics engine and renderer
- Loads high score from localStorage
- Sets up menu screen with event listeners
- Initializes fruit merge tracking array

### 2. Game Start (`startGame()`)
- Transitions from menu to gameplay
- Creates game walls and preview ball
- Attaches mouse/touch event handlers
- Sets up collision detection

### 3. Game Loop (Matter.js Runner)
- Physics simulation runs at 60fps
- Collision events trigger merge logic
- DOM updates for score display
- Canvas rendering handled by Matter.js

## Key Features Implementation

### Fruit Merging System

When two fruits collide:

```typescript
Events.on(engine, 'collisionStart', (e) => {
  // 1. Check if collision is between two fruits (not walls)
  // 2. Verify both fruits are same size
  // 3. Check neither is already popped
  // 4. Calculate merged fruit size
  // 5. Remove both fruits
  // 6. Create new larger fruit at midpoint
  // 7. Play merge sound
  // 8. Update score
});
```

### Collision Detection Logic

```typescript
// Skip static bodies (walls)
if (bodyA.isStatic || bodyB.isStatic) continue;

// Check lose condition (fruit too high)
if (aY < loseHeight || bY < loseHeight) {
  Game.loseGame();
  return;
}

// Type guard for fruit bodies
const fruitA = bodyA as FruitBody;
const fruitB = bodyB as FruitBody;

// Verify both are fruits with sizeIndex
if (fruitA.sizeIndex === undefined || 
    fruitB.sizeIndex === undefined) continue;

// Match sizes to merge
if (fruitA.sizeIndex !== fruitB.sizeIndex) continue;
```

### Score Calculation

Scores are calculated based on merged fruit counts:

```typescript
calculateScore(): void {
  const score = Game.fruitsMerged.reduce((total, count, sizeIndex) => {
    const value = Game.fruitSizes[sizeIndex].scoreValue * count;
    return total + value;
  }, 0);
  Game.score = score;
}
```

### Responsive Canvas

Canvas automatically scales to viewport:

```typescript
const resizeCanvas = (): void => {
  const screenWidth = document.body.clientWidth;
  const screenHeight = document.body.clientHeight;
  
  // Calculate scale based on aspect ratio
  if (screenWidth * 1.5 > screenHeight) {
    newHeight = Math.min(Game.height, screenHeight);
    newWidth = newHeight / 1.5;
  } else {
    newWidth = Math.min(Game.width, screenWidth);
    newHeight = newWidth * 1.5;
  }
  
  // Apply CSS transforms
  render.canvas.style.width = `${newWidth}px`;
  render.canvas.style.height = `${newHeight}px`;
  Game.elements.ui.style.transform = `scale(${scaleUI})`;
};
```

## TypeScript Integration

### Type Safety Features

1. **Strict Null Checks** - All DOM access is null-safe:
```typescript
if (Game.elements.score) {
  Game.elements.score.innerText = Game.score.toString();
}
```

2. **Custom Type Guards** - Runtime type validation:
```typescript
if (fruitA.sizeIndex === undefined) continue;
```

3. **Module Augmentation** - Extending Matter.js types:
```typescript
declare module 'matter-js' {
  interface Body {
    sizeIndex?: number;
    popped?: boolean;
  }
}
```

### Interface Design

All major data structures have TypeScript interfaces:

- `FruitSize` - Fruit configuration
- `GameCache` - Persistent storage
- `GameElements` - DOM references
- `FruitBody` - Physics body with game data
- `GameInterface` - Complete game object type

## Performance Optimizations

### 1. Asset Preloading
All audio files are preloaded at initialization:
```typescript
sounds: {
  click: new Audio('./assets/click.mp3'),
  pop0: new Audio('./assets/pop0.mp3'),
  // ... more sounds
}
```

### 2. Efficient Collision Filtering
Early returns prevent unnecessary calculations:
```typescript
if (bodyA.isStatic || bodyB.isStatic) continue;
if (fruitA.popped || fruitB.popped) continue;
```

### 3. Canvas Rendering
Matter.js handles efficient canvas updates with sprite rendering:
```typescript
render: {
  sprite: {
    texture: size.img,
    xScale: size.radius / 512,
    yScale: size.radius / 512
  }
}
```

## Data Persistence

High scores are saved to localStorage:

```typescript
saveHighscore(): void {
  Game.calculateScore();
  if (Game.score < Game.cache.highscore) return;
  
  Game.cache.highscore = Game.score;
  localStorage.setItem('suika-game-cache', 
    JSON.stringify(Game.cache));
}
```

## Build Process

### Development
```bash
npm run dev  # Vite dev server with HMR
```

Vite provides:
- Hot Module Replacement (HMR)
- TypeScript compilation
- Asset handling
- Fast refresh

### Production
```bash
npm run build  # TypeScript check + Vite build
```

Build process:
1. TypeScript type checking (`tsc`)
2. Vite bundling and minification
3. Asset optimization
4. Output to `dist/` directory

## Browser Compatibility

### Minimum Requirements
- Modern browsers with ES2020 support
- Canvas API support
- Web Audio API support
- LocalStorage support

### Tested Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancement Ideas

1. **Multiplayer Mode** - WebSocket-based real-time multiplayer
2. **Power-ups** - Special abilities and items
3. **Themes** - Customizable visual themes
4. **Leaderboards** - Global high score tracking
5. **Progressive Web App** - Offline support and installability
6. **Touch Gestures** - Improved mobile controls
7. **Particle Effects** - Enhanced visual feedback
8. **Sound Toggle** - Mute/unmute option
9. **Difficulty Levels** - Adjustable game speed
10. **Achievement System** - Unlock rewards

## Testing Strategy

### Type Safety
- Strict TypeScript compilation
- No implicit any types
- Strict null checking enabled

### Runtime Validation
- Type guards for collision bodies
- Null checks before DOM manipulation
- Boundary checks for game physics

### Manual Testing
- Cross-browser testing
- Mobile responsiveness
- Audio playback
- LocalStorage persistence
- Game state transitions

## Debug Tools

Enable Matter.js debug rendering:
```typescript
const render = Render.create({
  element: Game.elements.canvas,
  engine,
  options: {
    width: Game.width,
    height: Game.height,
    wireframes: true,  // Enable debug view
    background: '#ffdcae'
  }
});
```

## Code Style Guidelines

1. **Naming Conventions**
   - PascalCase for types/interfaces
   - camelCase for variables/functions
   - UPPER_CASE for constants

2. **Type Annotations**
   - Explicit return types on all functions
   - Prefer interfaces over type aliases
   - Use enums for finite sets

3. **Null Safety**
   - Always check nullable DOM elements
   - Use optional chaining where appropriate
   - Provide fallback values

4. **Code Organization**
   - Related functionality grouped together
   - Clear separation of concerns
   - Self-documenting code with descriptive names

## Resources

- [Matter.js Documentation](https://brm.io/matter-js/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
