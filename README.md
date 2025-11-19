# Princess & Bear 3D Chase

A thrilling 3D browser game built with Three.js. Help the princess escape the angry bear in a dense, walled forest!

## 🎮 How to Play

1.  **Objective**: Run away from the bear! If he catches you, it's Game Over.
2.  **Controls**: Use the **Arrow Keys** to move the Princess.
    *   ⬆️ Up
    *   ⬇️ Down
    *   ⬅️ Left
    *   ➡️ Right

## 🐻 Enemy Behavior

The bear is not just a mindless chaser. He has some tricks up his sleeve:

*   **Smart Navigation**: He will try to slide around obstacles to get to you.
*   **Robot Vacuum AI**: If he gets stuck, he enters "Unstick Mode" and tries a random direction to break free.
*   **😡 ANGRY TURBO MODE**: Watch out! If the bear gets stuck, he turns **RED**, opens his mouth, and gets a massive **Speed Boost** for 3 seconds. Do not let him catch you when he's angry!

## 🏰 The World

*   **Compact Map**: A tight 80x80 forest area.
*   **Boundaries**: Surrounded by high stone walls. There is no escape!
*   **Atmosphere**: Dense trees and dark green grass create a moody setting.

## 🚀 Deployment

This game is ready for static deployment.

### Vercel
1.  Upload the `princess-and-bear` folder to Vercel.
2.  Deploy! No build configuration needed.

### Local Development
To run the game locally, you need a local server to handle ES6 modules.

```bash
# Python 3
python3 -m http.server 8080

# Node.js (http-server)
npx http-server .
```

Then open your browser to `http://localhost:8080`.

## 🛠 Technologies

*   **Three.js**: For all 3D rendering and physics.
*   **Vanilla JavaScript**: No heavy frameworks, just pure code.
