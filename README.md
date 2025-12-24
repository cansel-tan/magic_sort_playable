# MagicSort - Interactive Liquid Pouring Game

MagicSort is an interactive liquid pouring game developed with PixiJS and TypeScript. Players experience an interactive gameplay by pouring liquid between bottles.
This project focuses on real-time interaction, animation performance, and visual feedback in browser-based games.

## Features

- **Interactive Bottle Control**: Control the liquid pouring process by clicking on bottles
- **Realistic Physics Simulation**: Physics-based animations for liquid flow and bottle movements
- **Visual Effects**:
  - Liquid flow lines
  - Surface ripple effects
  - Liquid fill effects
  - Cursor highlight effects
- **Responsive Design**: Interface compatible with mobile and desktop devices
- **Performance Optimization**: WebGL-based high-performance rendering

## Technologies

- **PixiJS v8.14.3**: 2D WebGL rendering engine
- **TypeScript**: For type safety
- **Vite**: Fast development and build tool
- **GSAP v3.13.0**: Animation library
- **ESLint & Prettier**: Code quality and formatting

## Requirements

- **Node.js**: v18 or higher
  - Download: https://nodejs.org/en/download

## Installation

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

or

```bash
npm run dev
```

## Build

For production build:

```bash
npm run build
```

Lint check and TypeScript compilation are performed automatically before build.

## Project Structure

```
MagicSort/
├── src/
│   ├── core/              # Core application logic
│   │   ├── App.ts         # PixiJS application initialization
│   │   ├── Loader.ts      # Asset loading
│   │   └── bottle/        # Core modules related to bottle
│   ├── bottle/            # Bottle class
│   ├── scenes/            # Game scenes
│   ├── effects/           # Visual effects
│   ├── graphics/          # Graphics filters
│   └── main.ts            # Entry point
├── public/
│   └── assets/            # Game assets (bottle images, effects)
└── index.html             # HTML template
```

## Main Modules

- **Bottle**: Bottle logic and rendering operations
- **BottlePhysics**: Physics simulation
- **BottleAnimation**: Animation controls
- **BottleFlowController**: Liquid flow control
- **FlowLineEffects**: Flow line effects
- **LiquidFillEffects**: Liquid fill effects
- **RippleSurfaceFilter**: Surface ripple filter
- **CursorHighlight**: Cursor highlight effect

## Scripts

- `npm run dev`: Starts the development server
- `npm run build`: Creates production build
- `npm run lint`: Performs code check with ESLint

## Notes

- The project requires WebGL support
- Shows best performance in modern browsers
- Works on mobile devices thanks to responsive design
