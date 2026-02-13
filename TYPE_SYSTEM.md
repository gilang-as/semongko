# TypeScript Type System

## Overview
The project uses a comprehensive TypeScript type system with strict null checking and type safety.

## Core Interfaces

### `FruitSize`
Defines the properties of each fruit type:
- `radius: number` - The radius of the fruit circle
- `scoreValue: number` - Points awarded when merged
- `img: string` - Path to the fruit sprite image

### `GameCache`
Stores persistent game data:
- `highscore: number` - The highest score achieved

### `GameElements`
References to DOM elements (all nullable for safety):
- `canvas: HTMLElement | null` - Main game canvas container
- `ui: HTMLElement | null` - UI overlay
- `score: HTMLElement | null` - Score display
- `end: HTMLElement | null` - Game over screen
- `endTitle: HTMLElement | null` - Game over title
- `statusValue: HTMLElement | null` - High score display
- `nextFruitImg: HTMLImageElement | null` - Next fruit preview
- `previewBall: Matter.Body | null` - Current preview ball

### `FruitBody` extends `Matter.Body`
Custom physics body with game properties:
- `sizeIndex: number` - Index in fruitSizes array
- `popped: boolean` - Whether fruit has been merged

### `GameStates` enum
Game state machine:
- `MENU = 0` - Main menu screen
- `READY = 1` - Ready to drop fruit
- `DROP = 2` - Fruit is dropping
- `LOSE = 3` - Game over

### `GameInterface`
Complete type definition for the Game object with all methods and properties.

## Type Safety Features

1. **Strict Null Checks** - All DOM element access is null-safe
2. **Explicit Return Types** - All functions have defined return types
3. **Type Guards** - Runtime checks for undefined/null values
4. **Strict Equality** - Uses `===` instead of `==` throughout
5. **Event Typing** - Proper Matter.js event types for collision and mouse events

## Module Augmentation

The `types.d.ts` file extends Matter.js types to include game-specific properties on Body objects without TypeScript errors.

## Best Practices

- Always check for null before accessing DOM elements
- Use type assertions (`as Type`) only when necessary
- Prefer type inference where types are obvious
- Use strict comparison operators (`===`, `!==`)
- Define interfaces for all data structures
