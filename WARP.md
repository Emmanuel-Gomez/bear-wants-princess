# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a browser-based 3D game built with Three.js. The player controls a princess character who must avoid a pursuing bear in a castle courtyard environment. The game features:

- **3D Scene**: Castle with towers, walls, keep, and environmental elements (trees, ground, path)
- **Player Character**: Princess controlled via arrow keys
- **Enemy AI**: Bear with chase behavior and collision-based "angry mode"
- **Collision Detection**: Characters interact with castle structures, trees, and boundaries
- **Game Mechanics**: Game restarts when bear catches the princess

## Development Setup

This is a static HTML/CSS/JavaScript project with no build process. Simply open `index.html` in a browser to run.

### Running the Game
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js http-server (if installed)
npx http-server
```

Then open `http://localhost:8000` in your browser.

## Architecture

### File Structure

- **index.html**: Entry point, imports Three.js via importmap
- **script.js**: Main game logic (scene setup, 3D objects, game loop, AI)
- **style.css**: Minimal styling (fullscreen canvas)

### Key Components in script.js

**Scene Setup (Lines 4-39)**
- Scene with sky blue background and fog
- Camera positioned at (0, 15, 30)
- OrbitControls for camera manipulation
- Lighting: ambient + directional with shadows

**Materials (Lines 41-58)**
- Shared materials for stone, wood, roof across castle structures
- Uses MeshStandardMaterial for realistic lighting

**Environment Objects**
- Ground plane (80x80 units)
- Boundary walls (invisible collision boxes at map edges, lines 69-100)
- Stone path leading to castle gate
- 100 procedurally placed trees with trunks and conical leaves (lines 112-152)

**Castle Construction**
- Helper functions: `createCrenellations()`, `createTower()`, `createWall()`
- Layout: 4 corner towers (14x14 grid), connecting walls with battlements
- Gatehouse: pillars, arch, wooden door (lines 265-303)
- Keep: central 8x8x10 building with windows (lines 306-355)
- All structures tagged with `userData.collidable = true`

**Characters**
- Princess (lines 362-405): Cone dress, cylindrical torso, sphere head with hair
- Bear (lines 412-468): Multiple spheres/cylinders for body parts, stores AI state in `userData`

**Game Logic**
- Arrow key input handling (lines 474-491)
- Collision detection: `checkCollision()` checks against all `collidable` objects (lines 498-516)
- Princess movement with collision prevention (lines 523-560)
- Bear AI state machine (lines 562-633):
  - `CHASE`: Moves toward princess at `bearSpeed`
  - `UNSTICK`: Moves in random direction when hitting obstacles
  - "Angry mode" triggered on collision: visual changes (red fur, open mouth) + 2.5x speed boost for 3 seconds
- Camera follows princess with lerp smoothing (lines 636-640)
- Game over: page reload when distance < 1.5 (line 631)

### Three.js Version

Uses Three.js v0.160.0 via CDN (unpkg). The importmap in index.html maps:
- `three` → three.module.js
- `three/addons/` → examples/jsm/

## Common Modifications

### Adjusting Difficulty

**Bear Speed**: Change `bearSpeed` constant (line 494)
```js
const bearSpeed = 0.1; // Current speed
```

**Angry Mode Parameters** (lines 601-602):
```js
bear.userData.unstickTimer = 20;  // Unstick duration (frames)
bear.userData.turboTimer = 180;   // Angry mode duration (frames)
```

**Catch Distance**: Modify collision check (line 630)
```js
if (distance < 1.5) { // Current catch radius
```

### Adding New Structures

1. Create geometry using Three.js primitives (BoxGeometry, CylinderGeometry, etc.)
2. Apply appropriate material (stoneMaterial, woodMaterial, etc.)
3. Set `castShadow` and `receiveShadow` properties
4. If solid, add `userData.collidable = true`
5. Position and add to scene or castle group

**Important**: After adding collidable objects, regenerate collision boxes by ensuring object is added before line 500 (where collision detection is initialized).

### Modifying Character Appearance

Characters use basic geometric primitives. To change:
- Adjust geometry parameters (radii, heights)
- Modify material colors (e.g., princess dress color at line 368)
- Add/remove body parts by creating new meshes

### Camera Behavior

**Follow Distance** (line 636):
```js
const cameraOffset = new THREE.Vector3(0, 10, 20); // X, Y, Z offset
```

**Smoothing** (line 639):
```js
camera.position.lerp(targetPosition, 0.1); // 0.1 = interpolation factor
```

## Code Patterns

### Creating 3D Objects

All castle structures follow this pattern:
1. Create Group to hold multiple meshes
2. Build geometry and apply materials
3. Position relative to group origin
4. Add shadow properties
5. Tag for collision if solid
6. Return group

### Collision Detection System

- Initialization: Traverse scene once, create Box3 for each `userData.collidable` object (lines 499-506)
- Runtime: `checkCollision()` creates temporary Box3 around character position and tests intersection
- Characters store size parameter (princess: 0.6, bear: 0.8)

### State Management

Game state stored in object userData:
- `bear.userData.state`: Current AI state string
- `bear.userData.unstickTimer`: Countdown for UNSTICK duration
- `bear.userData.turboTimer`: Countdown for angry mode
- `bear.userData.unstickDir`: Vector3 for random movement direction

## Browser Compatibility

Requires modern browser with:
- ES6 module support
- WebGL for Three.js
- Import maps (supported in Chrome 89+, Firefox 108+, Safari 16.4+)

## Known Limitations

- No mobile controls (arrow keys only)
- No sound effects or music
- Simple collision detection (box-based, no rotation consideration)
- No save/load or level progression
- Page reload on game over (no restart mechanism)
