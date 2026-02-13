# Suika / Watermelon Game Clone

![](./screenshot.png)

A TypeScript implementation of the popular Suika (Watermelon) game built with Vite, TypeScript, and the [Matter.js](https://github.com/liabru/matter-js) physics engine.

## 🚀 Features

- **Full TypeScript Support** - Comprehensive type system with strict null checking
- **Modern Build System** - Powered by Vite for fast development and optimized builds
- **Physics-Based Gameplay** - Realistic fruit dropping and merging using Matter.js
- **Responsive Design** - Automatically scales to fit different screen sizes
- **Persistent High Score** - Tracks your best score using localStorage
- **Sound Effects** - Audio feedback for clicks and fruit merges

## 🛠️ Tech Stack

- **TypeScript** - Type-safe JavaScript with strict mode enabled
- **Vite** - Next-generation frontend tooling
- **Matter.js** - 2D physics engine for realistic gameplay
- **Vanilla TS** - No framework dependencies, pure TypeScript

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Play

1. Click to drop fruits into the container
2. Match two fruits of the same size to merge them
3. Create larger fruits to score more points
4. Keep fruits below the red line or it's game over!
5. Try to create the largest watermelon and beat your high score

## 📁 Project Structure

```
suika-game-main/
├── src/
│   ├── main.ts          # Main game logic with TypeScript
│   └── types.d.ts       # Type definitions extending Matter.js
├── public/
│   └── assets/          # Static assets (images, sounds)
│       └── img/         # Fruit sprites and UI elements
├── index.html           # Entry HTML file
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── TYPE_SYSTEM.md       # Type system documentation
└── README.md            # This file
```

## 🔧 Development

The project uses TypeScript with strict type checking enabled. All DOM manipulations include null safety checks, and the game logic is fully typed.

### Key Files

- **[src/main.ts](src/main.ts)** - Main game engine with typed interfaces
- **[src/types.d.ts](src/types.d.ts)** - Module augmentation for Matter.js
- **[tsconfig.json](tsconfig.json)** - TypeScript compiler configuration
- **[TYPE_SYSTEM.md](TYPE_SYSTEM.md)** - Detailed type system documentation

## 📝 Type System

The project features a comprehensive TypeScript type system:

- `GameInterface` - Complete type definition for game object
- `FruitBody` - Extended Matter.js Body with game properties
- `GameStates` - Enum for game state machine
- `FruitSize` - Interface for fruit configuration
- Module augmentation for Matter.js types

See [TYPE_SYSTEM.md](TYPE_SYSTEM.md) for complete documentation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

- Original game concept: Suika Game (Aladdin X)
- Physics engine: [Matter.js](https://brm.io/matter-js/)
- Built with TypeScript and Vite

## 📚 Additional Documentation

- [Technical Documentation](TECHNICAL.md) - Architecture and implementation details
- [Claude MCP Documentation](CLAUDE.md) - AI-assisted development guide
