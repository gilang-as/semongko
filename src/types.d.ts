/**
 * Type declarations for Suika Game
 * Extends Matter.js types with game-specific properties
 */

import 'matter-js';

declare module 'matter-js' {
  interface Body {
    sizeIndex?: number;
    popped?: boolean;
  }

  interface Mouse {
    position: {
      x: number;
      y: number;
    };
  }

  interface IEvent<T> {
    name: string;
    source: T;
    mouse?: Mouse;
  }
}

export {};
