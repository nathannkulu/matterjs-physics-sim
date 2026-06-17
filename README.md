# Matter.js Physics Simulation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Matter.js](https://img.shields.io/badge/Matter.js-0.19.0-6c5ce7)](https://brm.io/matter-js/)

An interactive 2D physics sandbox built with [Matter.js](https://brm.io/matter-js/). Click to spawn physical objects, drag them around, and watch realistic rigid-body physics in real time.

## Features

- **Multiple shapes** — Spawn boxes, circles, polygons (5–8 sides), and ragdolls
- **Click & drag** — Grab any object and move it around
- **Ragdoll physics** — Jointed body with constraints between limbs
- **Real-time rendering** — Glow effects, shadows, and smooth 60 FPS
- **Dark theme UI** — Clean interface with shape selector and body counter

## Demo

Open `index.html` in any modern browser to run the simulation.

## Controls

| Action          | Input                          |
|-----------------|--------------------------------|
| Spawn shape     | Click on the canvas            |
| Select shape    | Click toolbar buttons          |
| Drag object     | Click and hold on a body       |
| Clear all       | Click "Clear All" button       |

## Project Structure

```
├── index.html         # Main HTML page
├── style.css          # UI styles (dark theme)
├── script.js          # Simulation logic
├── package.json       # npm metadata
└── README.md          # This file
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)

### Local Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/nathannkulu/matterjs-physics-sim.git
   ```
2. Open `index.html` in your browser — no build tools required.

### Using npm

```sh
npm install
```

Matter.js is loaded via CDN, so the local package is optional.

## Built With

- [Matter.js](https://brm.io/matter-js/) — 2D physics engine
- HTML5 Canvas — Custom rendering pipeline

## License

This project is open source and available under the [MIT License](LICENSE).
