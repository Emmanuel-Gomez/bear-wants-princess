import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(20, 50, 20);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

// Materials
const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x9caeb5,
    roughness: 0.9,
    flatShading: true
});
const darkStoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a5a65,
    roughness: 0.9
});
const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.8
});
const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B0000,
    roughness: 0.6
});


// Ground
const groundGeometry = new THREE.PlaneGeometry(80, 80); // Reduced from 200x200
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x004d00 }); // Darker Green
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Boundary Walls (Invisible or Stone)
const wallHeight = 3;
const wallThickness = 1;
const wallLength = 80;
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Grey Stone

const walls = new THREE.Group();
scene.add(walls);

// North Wall
const wallN = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial);
wallN.position.set(0, wallHeight / 2, -40);
wallN.userData.collidable = true;
walls.add(wallN);

// South Wall
const wallS = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial);
wallS.position.set(0, wallHeight / 2, 40);
wallS.userData.collidable = true;
walls.add(wallS);

// East Wall
const wallE = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), wallMaterial);
wallE.position.set(40, wallHeight / 2, 0);
wallE.userData.collidable = true;
walls.add(wallE);

// West Wall
const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), wallMaterial);
wallW.position.set(-40, wallHeight / 2, 0);
wallW.userData.collidable = true;
walls.add(wallW);

// Path
const pathGeometry = new THREE.PlaneGeometry(4, 30); // Adjusted length
const pathMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const path = new THREE.Mesh(pathGeometry, pathMaterial);
path.rotation.x = -Math.PI / 2;
path.position.set(0, 0.01, 15);
path.receiveShadow = true;
scene.add(path);

// Trees (Randomly placed, but not on path or castle)
const treeCount = 100;
for (let i = 0; i < treeCount; i++) {
    const tree = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.75;
    trunk.castShadow = true;
    trunk.userData.collidable = true; // Trunk is solid
    tree.add(trunk);

    const leavesGeo = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x006400 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 2.5;
    leaves.castShadow = true;
    tree.add(leaves);

    // Random Position (Avoid center castle area)
    let x, z;
    let validPosition = false;
    while (!validPosition) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 20; // Reduced radius: 15 to 35
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;

        // Simple check to avoid path (approximate)
        if (Math.abs(x) > 3 || z < 0) {
            validPosition = true;
        }
    }

    tree.position.set(x, 0, z);
    // Random rotation and scale variation
    tree.rotation.y = Math.random() * Math.PI;
    const scale = 0.8 + Math.random() * 0.4;
    tree.scale.set(scale, scale, scale);
    scene.add(tree);
}

// Castle Group
const castle = new THREE.Group();
scene.add(castle);

// Helper: Create Crenellations
function createCrenellations(width, numTeeth) {
    const group = new THREE.Group();
    const toothWidth = width / (numTeeth * 2 - 1);
    const toothHeight = 0.6;
    const toothDepth = 1.2;

    const geometry = new THREE.BoxGeometry(toothWidth, toothHeight, toothDepth);

    for (let i = 0; i < numTeeth; i++) {
        const tooth = new THREE.Mesh(geometry, stoneMaterial);
        // Position teeth along the width
        const xPos = -width / 2 + toothWidth / 2 + i * (toothWidth * 2);
        tooth.position.set(xPos, toothHeight / 2, 0);
        tooth.castShadow = true;
        tooth.receiveShadow = true;
        group.add(tooth);
    }
    return group;
}

// Helper: Create Tower
function createTower(x, z) {
    const towerGroup = new THREE.Group();

    // Base
    const baseGeometry = new THREE.CylinderGeometry(2, 2.2, 10, 16);
    const base = new THREE.Mesh(baseGeometry, stoneMaterial);
    base.position.y = 5;
    base.castShadow = true;
    base.receiveShadow = true;
    base.userData.collidable = true; // Tag for collision
    towerGroup.add(base);

    // Windows
    for (let i = 0; i < 3; i++) {
        const winGeo = new THREE.BoxGeometry(0.4, 0.8, 0.2);
        const win = new THREE.Mesh(winGeo, darkStoneMaterial);
        win.position.set(0, 3 + i * 2.5, 2); // Front facing
        towerGroup.add(win);
    }

    // Roof Overhang/Battlements
    const rimGeometry = new THREE.CylinderGeometry(2.4, 2.2, 1, 16);
    const rim = new THREE.Mesh(rimGeometry, stoneMaterial);
    rim.position.y = 10.5;
    rim.castShadow = true;
    rim.receiveShadow = true;
    towerGroup.add(rim);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(2.8, 4, 16);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 13;
    roof.castShadow = true;
    towerGroup.add(roof);

    towerGroup.position.set(x, 0, z);
    return towerGroup;
}

// Helper: Create Wall
function createWall(x, z, rotationY, length) {
    const wallGroup = new THREE.Group();

    const height = 6;
    const thickness = 1;

    const wallGeometry = new THREE.BoxGeometry(length, height, thickness);
    const wall = new THREE.Mesh(wallGeometry, stoneMaterial);
    wall.position.y = height / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.collidable = true; // Tag for collision
    wallGroup.add(wall);

    // Battlements
    const crenellations = createCrenellations(length, Math.floor(length));
    crenellations.position.y = height;
    wallGroup.add(crenellations);

    wallGroup.position.set(x, 0, z);
    wallGroup.rotation.y = rotationY;
    return wallGroup;
}

// Build Castle Layout
const width = 14;
const depth = 14;

// Towers
castle.add(createTower(-width / 2, -depth / 2));
castle.add(createTower(width / 2, -depth / 2));
castle.add(createTower(-width / 2, depth / 2));
castle.add(createTower(width / 2, depth / 2));

// Walls
castle.add(createWall(0, -depth / 2, 0, width - 2)); // Back
castle.add(createWall(-width / 2, 0, Math.PI / 2, depth - 2)); // Left
castle.add(createWall(width / 2, 0, Math.PI / 2, depth - 2)); // Right

// Front Wall (Split for Gate)
const frontWallLen = (width - 6) / 2;
castle.add(createWall(-width / 2 + frontWallLen / 2 + 1, depth / 2, 0, frontWallLen));
castle.add(createWall(width / 2 - frontWallLen / 2 - 1, depth / 2, 0, frontWallLen));

// Gatehouse
const gateGroup = new THREE.Group();
const gateHeight = 7;
const gateWidth = 6;
const gateDepth = 2;

// Gate Structure
const gateGeo = new THREE.BoxGeometry(gateWidth, gateHeight, gateDepth);
// Create a hole for the door (using multiple boxes instead of CSG for simplicity)
// Left Pillar
const pillarGeo = new THREE.BoxGeometry(1.5, gateHeight, gateDepth);
const leftPillar = new THREE.Mesh(pillarGeo, stoneMaterial);
leftPillar.position.set(-2.25, gateHeight / 2, 0);
leftPillar.castShadow = true;
leftPillar.userData.collidable = true; // Tag for collision
gateGroup.add(leftPillar);

// Right Pillar
const rightPillar = new THREE.Mesh(pillarGeo, stoneMaterial);
rightPillar.position.set(2.25, gateHeight / 2, 0);
rightPillar.castShadow = true;
rightPillar.userData.collidable = true; // Tag for collision
gateGroup.add(rightPillar);

// Top Arch
const archGeo = new THREE.BoxGeometry(gateWidth, 2, gateDepth);
const arch = new THREE.Mesh(archGeo, stoneMaterial);
arch.position.set(0, gateHeight - 1, 0);
arch.castShadow = true;
gateGroup.add(arch);

// Door
const doorGeo = new THREE.BoxGeometry(3, 5, 0.5);
const door = new THREE.Mesh(doorGeo, woodMaterial);
door.position.set(0, 2.5, 0);
door.receiveShadow = true;
gateGroup.add(door);

gateGroup.position.set(0, 0, depth / 2);
castle.add(gateGroup);


// Keep (Main Building)
const keepGroup = new THREE.Group();
const keepWidth = 8;
const keepHeight = 10;
const keepDepth = 8;

const keepBody = new THREE.Mesh(
    new THREE.BoxGeometry(keepWidth, keepHeight, keepDepth),
    stoneMaterial
);
keepBody.position.y = keepHeight / 2;
keepBody.castShadow = true;
keepBody.receiveShadow = true;
keepBody.userData.collidable = true; // Tag for collision
keepGroup.add(keepBody);

// Keep Battlements
const keepCrenellations1 = createCrenellations(keepWidth, 5);
keepCrenellations1.position.set(0, keepHeight, keepDepth / 2 - 0.5);
keepGroup.add(keepCrenellations1);

const keepCrenellations2 = createCrenellations(keepWidth, 5);
keepCrenellations2.position.set(0, keepHeight, -keepDepth / 2 + 0.5);
keepGroup.add(keepCrenellations2);

const keepCrenellations3 = createCrenellations(keepDepth - 1, 4);
keepCrenellations3.rotation.y = Math.PI / 2;
keepCrenellations3.position.set(keepWidth / 2 - 0.5, keepHeight, 0);
keepGroup.add(keepCrenellations3);

const keepCrenellations4 = createCrenellations(keepDepth - 1, 4);
keepCrenellations4.rotation.y = Math.PI / 2;
keepCrenellations4.position.set(-keepWidth / 2 + 0.5, keepHeight, 0);
keepGroup.add(keepCrenellations4);

// Keep Windows
function createWindow(x, y, z) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.2), darkStoneMaterial);
    win.position.set(x, y, z);
    return win;
}
keepGroup.add(createWindow(0, 6, keepDepth / 2)); // Front
keepGroup.add(createWindow(-2, 6, keepDepth / 2));
keepGroup.add(createWindow(2, 6, keepDepth / 2));
keepGroup.add(createWindow(0, 6, -keepDepth / 2)); // Back
keepGroup.add(createWindow(keepWidth / 2, 6, 0).rotateY(Math.PI / 2)); // Right
keepGroup.add(createWindow(-keepWidth / 2, 6, 0).rotateY(Math.PI / 2)); // Left

keepGroup.position.set(0, 0, -2);
castle.add(keepGroup);


// Environment: Trees


// Character: Princess
function createPrincess(x, z) {
    const princessGroup = new THREE.Group();

    // Dress (Cone)
    const dressGeo = new THREE.ConeGeometry(0.6, 1.5, 16);
    const dressMat = new THREE.MeshStandardMaterial({ color: 0xFF69B4 }); // Hot Pink
    const dress = new THREE.Mesh(dressGeo, dressMat);
    dress.position.y = 0.75;
    dress.castShadow = true;
    princessGroup.add(dress);

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.25, 0.1, 0.6, 8);
    const torso = new THREE.Mesh(torsoGeo, dressMat);
    torso.position.y = 1.6; // 0.75 + 0.75 (dress height/2) + adjustment
    torso.castShadow = true;
    princessGroup.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFDFC4 }); // Skin tone
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.0;
    head.castShadow = true;
    princessGroup.add(head);

    // Hair (Blonde)
    const hairGeo = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Gold/Blonde
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.02;
    hair.rotation.x = Math.PI; // Flip to cover top of head
    hair.castShadow = true;
    princessGroup.add(hair);

    // Long Hair (Back)
    const longHairGeo = new THREE.BoxGeometry(0.4, 0.6, 0.1);
    const longHair = new THREE.Mesh(longHairGeo, hairMat);
    longHair.position.set(0, 1.9, -0.2);
    princessGroup.add(longHair);

    princessGroup.position.set(x, 0, z);
    return princessGroup;
}

// Add Princess to scene
const princess = createPrincess(0, 14); // Standing on the path
scene.add(princess);

// Enemy: Bear
function createBear(x, z) {
    const bearGroup = new THREE.Group();

    const furMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 1 }); // SaddleBrown

    // Body
    const bodyGeo = new THREE.SphereGeometry(1, 16, 16);
    const body = new THREE.Mesh(bodyGeo, furMaterial);
    body.scale.set(1, 0.8, 1.2);
    body.position.y = 1;
    body.castShadow = true;
    bearGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const head = new THREE.Mesh(headGeo, furMaterial);
    head.position.set(0, 1.5, 0.8);
    head.castShadow = true;
    bearGroup.add(head);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const ear1 = new THREE.Mesh(earGeo, furMaterial);
    ear1.position.set(0.4, 1.9, 0.8);
    bearGroup.add(ear1);
    const ear2 = new THREE.Mesh(earGeo, furMaterial);
    ear2.position.set(-0.4, 1.9, 0.8);
    bearGroup.add(ear2);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
    const leg1 = new THREE.Mesh(legGeo, furMaterial);
    leg1.position.set(0.5, 0.4, 0.5);
    bearGroup.add(leg1);
    const leg2 = new THREE.Mesh(legGeo, furMaterial);
    leg2.position.set(-0.5, 0.4, 0.5);
    bearGroup.add(leg2);
    const leg3 = new THREE.Mesh(legGeo, furMaterial);
    leg3.position.set(0.5, 0.4, -0.5);
    bearGroup.add(leg3);
    const leg4 = new THREE.Mesh(legGeo, furMaterial);
    leg4.position.set(-0.5, 0.4, -0.5);
    bearGroup.add(leg4);

    // Mouth (for Angry Mode)
    const mouthGeo = new THREE.BoxGeometry(0.4, 0.2, 0.2);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black inside
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 1.4, 1.35); // On snout
    mouth.scale.set(0.1, 0.1, 0.1); // Hidden/Closed initially
    bearGroup.add(mouth);
    bearGroup.userData.mouth = mouth;
    bearGroup.userData.furMaterial = furMaterial; // Reference for color change

    bearGroup.position.set(x, 0, z);
    return bearGroup;
}

const bear = createBear(10, 10); // Spawn closer to princess
scene.add(bear);

// Character Movement Logic
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

const moveSpeed = 0.2;
const bearSpeed = 0.1; // Faster bear

let gameStarted = false;

// Collision Detection Setup
const collidables = [];
scene.updateMatrixWorld(true); // Ensure all matrices are updated
scene.traverse((object) => {
    if (object.userData.collidable) {
        const box = new THREE.Box3().setFromObject(object);
        collidables.push(box);
    }
});

function checkCollision(position, size = 0.5) {
    const playerBox = new THREE.Box3();
    playerBox.setFromCenterAndSize(position.clone().add(new THREE.Vector3(0, 1, 0)), new THREE.Vector3(size, 2, size));

    for (const box of collidables) {
        if (playerBox.intersectsBox(box)) return true;
    }
    return false;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Princess Movement
    let moved = false;
    const nextPos = princess.position.clone();
    let rotation = princess.rotation.y;

    if (keys.ArrowUp) {
        nextPos.z -= moveSpeed;
        rotation = Math.PI; // Face back
        moved = true;
    }
    if (keys.ArrowDown) {
        nextPos.z += moveSpeed;
        rotation = 0; // Face front
        moved = true;
    }
    if (keys.ArrowLeft) {
        nextPos.x -= moveSpeed;
        rotation = -Math.PI / 2; // Face left
        moved = true;
    }
    if (keys.ArrowRight) {
        nextPos.x += moveSpeed;
        rotation = Math.PI / 2; // Face right
        moved = true;
    }

    // Diagonal rotation adjustments
    if (keys.ArrowUp && keys.ArrowLeft) rotation = -Math.PI * 3 / 4;
    if (keys.ArrowUp && keys.ArrowRight) rotation = Math.PI * 3 / 4;
    if (keys.ArrowDown && keys.ArrowLeft) rotation = -Math.PI / 4;
    if (keys.ArrowDown && keys.ArrowRight) rotation = Math.PI / 4;

    if (moved) {
        princess.rotation.y = rotation;
        if (!checkCollision(nextPos, 0.6)) { // Princess size
            princess.position.copy(nextPos);
            gameStarted = true;
        }
    }

    // Bear Logic (Chase) - Only if game started
    if (gameStarted) {
        // State Machine Variables
        if (!bear.userData.state) {
            bear.userData.state = 'CHASE';
            bear.userData.unstickTimer = 0;
            bear.userData.turboTimer = 0; // New timer for angry mode duration
            bear.userData.unstickDir = new THREE.Vector3();
        }

        const bearSize = 0.8;

        // Determine current speed and visuals based on Turbo Timer
        let currentSpeed = bearSpeed;
        if (bear.userData.turboTimer > 0) {
            currentSpeed = bearSpeed * 2.5; // Turbo speed
            bear.userData.turboTimer--;

            // Ensure visuals are Angry
            bear.userData.furMaterial.color.setHex(0xFF0000);
            bear.userData.mouth.scale.set(1, 1, 1);
        } else {
            // Reset Visuals to Normal
            bear.userData.furMaterial.color.setHex(0x8B4513);
            bear.userData.mouth.scale.set(0.1, 0.1, 0.1);
        }

        if (bear.userData.state === 'CHASE') {
            const direction = new THREE.Vector3();
            direction.subVectors(princess.position, bear.position).normalize();
            const moveVector = direction.multiplyScalar(currentSpeed);
            const targetPos = bear.position.clone().add(moveVector);

            if (!checkCollision(targetPos, bearSize)) {
                bear.position.copy(targetPos);
                bear.lookAt(princess.position);
            } else {
                // Collision! Switch to UNSTICK mode
                bear.userData.state = 'UNSTICK';
                bear.userData.unstickTimer = 20; // Short burst (approx 0.3s) - "Make that direction shorter"
                bear.userData.turboTimer = 180; // Long turbo (approx 3s) - "Turbo mode longer"

                // Pick random direction
                const angle = Math.random() * Math.PI * 2;
                bear.userData.unstickDir.set(Math.cos(angle), 0, Math.sin(angle));
            }
        } else if (bear.userData.state === 'UNSTICK') {
            const moveVector = bear.userData.unstickDir.clone().multiplyScalar(currentSpeed);
            const targetPos = bear.position.clone().add(moveVector);

            if (!checkCollision(targetPos, bearSize)) {
                bear.position.copy(targetPos);
                bear.lookAt(targetPos);
            } else {
                // Hit something else? Pick NEW random direction immediately
                const angle = Math.random() * Math.PI * 2;
                bear.userData.unstickDir.set(Math.cos(angle), 0, Math.sin(angle));
            }

            bear.userData.unstickTimer--;
            if (bear.userData.unstickTimer <= 0) {
                bear.userData.state = 'CHASE';
                // Note: We do NOT reset turboTimer here, so he stays angry/fast for a while!
            }
        }

        // Game Over (Collision)
        const distance = princess.position.distanceTo(bear.position);
        if (distance < 1.5) {
            location.reload();
        }
    }

    // Camera Follow Logic
    const cameraOffset = new THREE.Vector3(0, 10, 20); // Relative offset
    // Smoothly interpolate camera position
    const targetPosition = princess.position.clone().add(cameraOffset);
    camera.position.lerp(targetPosition, 0.1);
    controls.target.copy(princess.position);

    controls.update();
    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
